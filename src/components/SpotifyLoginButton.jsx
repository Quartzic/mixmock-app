export const SpotifyLoginButton = () => {
  return (
    <div>
      <a
        href="https://accounts.spotify.com/authorize?client_id=c1aea54615cc4327ab39d917dae0f476&response_type=code&redirect_uri=https://mixtape-mocktails.web.app/callback&scope=user-top-read"
        className="flex w-full items-center justify-center gap-3 rounded-md bg-slate-600  px-3 py-1.5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24292F]"
      >
        <span className="text-sm font-semibold leading-6">
          Add a drink to the queue
        </span>
      </a>
    </div>
  );
};
