export default function Home() {
  return (
    <main className="bg-gray-100 sm:bg-red-100 md:bg-green-100 lg:bg-cyan-100 xl:bg-orange-100 2xl:bg-purple-100 h-screen flex items-center justify-center p-5">
      <div
        className="bg-white shadow-lg p-5 rounded-3xl w-full max-w-screen-sm flex flex-col md:flex-row gap-2
        *:outline-none ring-transparent has-[:invalid]:ring has-[:invalid]:ring-red-300 transition-shadow"
      >
        <input
          className="flex-grow rounded-full h-10 bg-gray-200 pl-5 transition-shadow 
          placeholder:drop-shadow 
          ring ring-transparent 
          focus:ring-green-500 focus:ring-offset-2 
          invalid:focus:ring-red-500 peer"
          type="email"
          required
          placeholder="Email address"
        />
        <span
          className="text-red-500 font-medium
          hidden peer-invalid:block"
        >
          Email is required.
        </span>
        <button
          className="text-white py-2 rounded-full active:scale-90 transition-transform font-medium
          md:px-10 
          bg-gradient-to-tr from-cyan-500 via-yellow-400 to-purple-400"
        >
          Log in
        </button>
      </div>
    </main>
  );
}
