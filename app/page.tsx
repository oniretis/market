import { ProductRow } from "./components/ProductRow";
import Hero from "./components/Hero";

export default function Home() {
  return (
    <main>
      <Hero />
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-24">
        <ProductRow category="newest" />
        <ProductRow category="properties" />
        <ProductRow category="gadgets" />
        <ProductRow category="cars" />
        <ProductRow category="others" />
      </section>
    </main>
  );
}
