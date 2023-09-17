/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onCall, onRequest } = require("firebase-functions/v2/https");

const logger = require("firebase-functions/logger");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const OpenAI = require("openai");
const axios = require("axios");
const { defineString } = require("firebase-functions/params");
const { INGREDIENTS } = require("./ingredients");
const clientId = defineString("SPOTIFY_CLIENT_ID").value();
const clientSecret = defineString("SPOTIFY_CLIENT_SECRET").value();
const redirectUri = defineString("SPOTIFY_REDIRECT_URI").value();
const openAIKey = defineString("OPENAI_API_KEY").value();

initializeApp();
const db = getFirestore();

exports.getAccessToken = onCall(async ({ data, context }) => {
  const code = data.code;
  const tokenEndpoint = "https://accounts.spotify.com/api/token";
  const authString = `${clientId}:${clientSecret}`;
  const headers = {
    Authorization: "Basic " + Buffer.from(authString).toString("base64"),
    "Content-Type": "application/x-www-form-urlencoded",
  };

  console.log("Auth String:", authString);

  const body = new URLSearchParams();
  body.append("grant_type", "authorization_code");
  body.append("code", code);
  body.append("redirect_uri", redirectUri);

  console.log("Authorization Code for Spotify: ", code);
  try {
    const result = await axios.post(tokenEndpoint, body.toString(), {
      headers: headers,
    });
    return result.data.access_token;
  } catch (error) {
    console.error(error.response.data);
    throw new Error(error.response.data);
  }

  //const responseData = await response.data;

  //const responseData = await response.json();
  //return response.data.access_token;
});

exports.createJobFromPrompt = onCall(async ({ data, context }) => {
  // get a prompt, call OpenAI to generate recipe text, then create a job in the database
  console.log("createJobFromPrompt called", data);

  if (!data.tracks || !data.artists || !data.userProfile) {
    return null;
  }

  // TRACK AND ARTIST PARSING
  // Extract comma-delimited strings from topTracks and topArtists
  const tracksFormatted = data.tracks.map((obj) => obj.name).join(", ");
  const artistsFormatted = data.artists.map((obj) => obj.name).join(", ");

  // Extract genres from top artists
  let genres = [];
  data.artists.forEach((artist) => {
    genres = genres.concat(artist.genres);
  });

  if (genres.length > 5) {
    // Durstenfeld shuffle
    for (let i = genres.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [genres[i], genres[j]] = [genres[j], genres[i]];
    }

    // return first 5 elements
    genres = genres.slice(0, 5);
  }

  const openai = new OpenAI({
    apiKey: openAIKey,
  });

  const functions = [
    {
      name: "createRecipe",
      description:
        "Creates a recipe for a non-alcoholic mixed drink based on the user's music taste.",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description:
              "The name of the drink. Choose a creative, unique name.",
          },
          description: {
            type: "string",
            description: `A description of the drink. Explain in a few sentences how the different elements of the drink are related to artists and songs that the user likes, using specific examples and descriptive language.`,
          },
          ingredients: {
            type: "array",
            description:
              "The ingredients in the drink. Use at most three so that the flavors are not too overwhelming or clashing.",
            items: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "The ID of the ingredient.",
                  enum: INGREDIENTS.map((ingredient) => ingredient.id),
                },
                amountOz: {
                  type: "number",
                  description: "The amount of the ingredient (in ounces).",
                },
                explanation: {
                  type: "string",
                  description:
                    "An explanation of how the ingredient relates to the prompt. Mention a specific artist or track that the user likes and how it is similar to the ingredient. (For example: The pop synth vibes from The Weekend are represented by the seltzer water in this drink.)",
                },
              },
            },
          },
        },
      },
    },
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0613",
    messages: [
      {
        role: "user",
        content: `Create a recipe for a non-alcoholic mixed drink inspired by genres such as ${genres.join(
          ", "
        )}, artists such as ${artistsFormatted} and track names such as ${tracksFormatted}. Use two to three ingredients.`,
      },
    ],
    functions: functions,
    function_call: {
      name: "createRecipe",
    },
  });

  const recipe = JSON.parse(
    completion.choices[0].message.function_call.arguments
  );

  const validSet = INGREDIENTS.map((ingredient) => ingredient.id);

  console.log("validSet", validSet);
  recipe.ingredients = recipe.ingredients.filter((recipeIngredient) =>
    validSet.includes(recipeIngredient.id)
  );
  console.log("recipe.ingredients", recipe.ingredients);
  // check if there are no ingredients
  if (recipe.ingredients.length === 0) {
    return {
      error: "No ingredients found",
    };
  }

  // recipe.ingredients.foreach((recipeIngredient) => {
  //   recipeIngredient.name = INGREDIENTS.find((ingredient) => ingredient.id === recipeIngredient.id).name;
  // });

  db.collection("jobs")
    .add({
      sourceInformation: {
        artists: data.artists,
        tracks: data.tracks,
      },
      drinkInformation: {
        name: recipe.name,
        description: recipe.description,
        ingredients: recipe.ingredients.map((ingredient) => {
          return {
            ...ingredient,
            amount: ingredient.amountOz,
          };
        }),
      },
      userProfile: data.userProfile,
      status: "DRAFT",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .then((docRef) => {
      console.log("Document written with ID: ", docRef.id);
      return {
        success: true,
        id: docRef.id,
      };
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
      return {
        error: error,
      };
    });
}); 

exports.getNextJobInQueue = onRequest(async (req, res) => {
  const jobsRef = db.collection("jobs");
  const query = jobsRef.where("status", "==", "PENDING");
  const snapshot = await query.get();

  if (snapshot.empty) {
    res.status(404).send("No pending jobs found");
    return;
  }

  // sort and limit locally
  const nextJobInQueue = snapshot.docs.sort((a, b) => {
    return a.createdAt - b.createdAt;
  })[0];

  // update job status to IN_PROGRESS
  await nextJobInQueue.ref.update({
    status: "SENT_TO_ROBOT",
    updatedAt: new Date(),
  });

  return res.status(200).send(nextJobInQueue.data());
});
