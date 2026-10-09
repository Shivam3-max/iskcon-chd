import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Illustration from "@/components/illustrations/Illustration";

export default function NotFound() {
  return (
    <>
    <Header today="" />
    <section className="grid min-h-[80vh] place-items-center px-5 pb-20 pt-[150px] text-center">
      <div>
        <Illustration figure="conch" className="mx-auto h-40 w-40" />
        <p className="eyebrow mt-6">Page not found</p>
        <h1 className="mt-3 text-[clamp(2.2rem,4vw,3.4rem)] text-ink">This path doesn&rsquo;t lead to the altar.</h1>
        <p className="lede mx-auto mt-3 max-w-md">The page may have moved. Let&rsquo;s get you back to the temple.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary">Home</Link>
          <Link href="/calendar" className="btn btn-ghost text-maroon">Vaishnava calendar</Link>
        </div>
      </div>
    </section>
    <Footer />
    </>
  );
}
