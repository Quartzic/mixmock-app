import classNames from "classnames";
import TimeAgo from "react-timeago";
import { Popover } from "antd";
import { INGREDIENTS } from "../ingredients";
import { updateDoc } from "firebase/firestore";

export const JobsList = ({ jobs }) => {
  console.log(jobs)
  return (
    <div>
      <ul role="list" className="space-y-8">
        {jobs &&
          jobs.map((jobItem, jobItemIdx) => (
            <div
              key={jobItemIdx}
              className="flex-auto rounded-md ring-1 ring-inset ring-gray-200 divide-y shadow"
            >
              <div className="flex justify-between gap-x-4 p-3">
                <div className="flex gap-3">
                  <Popover
                    content={
                      jobItem?.data().userProfile?.display_name ?? "Unknown User"
                    }
                  >
                    <img
                      className="inline-block w-8 h-8 sm:h-12 sm:w-12 rounded-full ring-2 ring-white hover:scale-125 hover:z-10 transition-all duration-100"
                      src={jobItem?.data().userProfile?.images[0]?.url ?? ""}
                      alt={
                        jobItem?.data().userProfile?.display_name ??
                        "Unknown User"
                      }
                    />
                  </Popover>

                  <div className="flex flex-col justify-between">
                    <h1 className="font-bold text-xl text-gray-900">
                      {jobItem.data().drinkInformation.name}
                    </h1>
                    <div className="text-xs text-gray-500 flex">
                      <div>
                        {(() => {
                          switch (jobItem.data().status) {
                            case "DRAFT":
                              return (
                                <>
                                  Pending approval by{" "}
                                  <span className="font-bold">
                                    {jobItem?.data().userProfile?.display_name ??
                                      "Unknown User"}
                                  </span>
                                </>
                              );
                            case "PENDING":
                              return "Waiting on robot";
                            case "SENT_TO_ROBOT":
                              return "Sent to robot";
                            case "DECLINED":
                              return "Declined";
                            default:
                              return "Unknown";
                          }
                        })()}
                        , <TimeAgo date={jobItem.data().updatedAt.toDate()} />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex -space-x-1">
                    {jobItem.data().sourceInformation.artists.map((artist) => {
                      return (
                        <Popover content={artist.name}>
                          <img
                            className="inline-block w-8 h-8 sm:h-12 sm:w-12 rounded-full ring-2 ring-white hover:scale-125 hover:z-10 transition-all duration-100"
                            src={
                              // get the smallest image
                              artist?.images?.sort(
                                (a, b) => a.width - b.width
                              )[0]?.url ?? ""
                            }
                            alt={artist.name}
                          />
                        </Popover>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 p-3">
                <div className="flex-1">
                  <p className="text-sm leading-6 text-gray-500">
                    {jobItem.data().drinkInformation.description}
                  </p>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  {jobItem.data().drinkInformation.ingredients.map(
                    (ingredient, ingredientIdx) => (
                      <div key={ingredientIdx} className="flex flex-col">
                        <div className="flex flex-row gap-x-2">
                          <div className="text-sm font-bold text-gray-900">
                            {
                              INGREDIENTS.find(
                                (ingredientCandidate) =>
                                  ingredientCandidate.id === ingredient.id
                              )?.name
                            }
                          </div>
                          <div className="text-sm text-gray-500">
                            {ingredient.amount} oz
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {ingredient.explanation}
                        </div>
                      </div>
                    )
                  )}
                </div>
                {jobItem.data().status === "DRAFT" && (
                  <div className="flex gap-2">
                    <button
                      className="flex w-full items-center justify-center gap-3 rounded-md bg-green-500  px-3 py-1.5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24292F]"
                      onClick={async () => {
                        await updateDoc(jobItem.ref, {
                          status: "PENDING",
                          updatedAt: new Date(),
                        });
                      }}
                    >
                      <span className="text-sm font-semibold leading-6">
                        Approve drink
                      </span>
                    </button>
                    <button
                      onClick={async () => {
                        await updateDoc(jobItem.ref, {
                          status: "DECLINED",
                          updatedAt: new Date(),
                        });
                      }}
                      className="flex w-full items-center justify-center gap-3 rounded-md bg-red-500  px-3 py-1.5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24292F]"
                    >
                      <span className="text-sm font-semibold leading-6">
                        Reject drink
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
      </ul>
    </div>
  );
};
