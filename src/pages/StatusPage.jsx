import { collection, onSnapshot } from "firebase/firestore";
import { db, functions } from "../firebase";
import { useState, useLocation } from "react";
import { JobsList } from "../components/JobsList";
import { SpotifyLoginButton } from "../components/SpotifyLoginButton";
import wineIcon from "../assets/wine-icon.svg";

// import {httpsCallable, connectFunctionsEmulator } from "firebase/functions";

// TODO: QR Code to /login, should navigate to root


export const MainPage = () => {
  // get jobs from firestore
  const [jobs, setJobs] = useState(null);

  onSnapshot(collection(db, "jobs"), (snapshot) => {
    setJobs(
      snapshot.docs
        .map((doc) => doc.data())
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
    );
  });

  return (
    <div className="min-h-full bg-[#1DB954] ">
      <header className="bg-[#1DB954]">
        <div className="mx-auto py-4 max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
          <div className="relative flex items-center justify-center py-5 lg:justify-between">
            {/* Logo */}
            <div className="absolute left-0 flex-shrink-0 lg:static">
              <a href="#">
                <div className="flex flex-row items-center gap-4">
                  <img
                    className="h-8 w-auto sm:h-10 text-white bg-white rounded-full p-1"
                    src={wineIcon}
                    alt="Mixtape Mocktails"
                  />

                  <span className="font-semibold text-xl text-white">
                    Mixtape Mocktails
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
            <div className="grid grid-cols-1 gap-4 md:order-last">
              <section>
                <div className="overflow-hidden rounded-lg bg-white shadow">
                  <div className="p-6">
                    <SpotifyLoginButton />
                  </div>
                </div>
              </section>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:col-span-2 md:order-first">
              <section>
                <div className="overflow-hidden rounded-lg bg-white shadow">
                  <div className="p-6">
                    <JobsList jobs={jobs} />
                    {jobs === null ? (
                      <div className="flex justify-center">
                        <p className="text-gray-500">Loading...</p>
                      </div>
                    ) : jobs.length === 0 ? (
                      <div className="flex justify-center">
                        <p className="text-gray-500">No drinks in the queue.</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <footer>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
          <div className="py-8 text-center text-sm text-white sm:text-left flex flex-col gap-2 opacity-75">
            <span className="block sm:inline">
              Made with ❤️ at HackMIT 2023 by Nathan, Vikram, Tolu, and Trevor.
            </span>{" "}
            <span className="block sm:inline">All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
