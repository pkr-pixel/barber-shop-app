// app/page.js
import CalendarComponent from "../components/Calendar"; // We will create this next

export default function Home() {
  return (
    <main style={{ padding: "2rem" }}>
      {/* This is where your scheduling logic will eventually live */}
      <section>
        <CalendarComponent />
      </section>
    </main>
  );
}
