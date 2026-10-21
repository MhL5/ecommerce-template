"use client";

export default function Page() {
  async function handleClick() {}

  return (
    <section className="grid min-h-dvh w-full place-items-center">
      <div>
        <button onClick={handleClick}>{"Click me"}</button>
      </div>
    </section>
  );
}
