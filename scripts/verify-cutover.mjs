import { readFileSync } from "fs";

function check(path, needles) {
  const html = readFileSync(path, "utf8");
  console.log("\n" + path);
  for (const n of needles) {
    console.log(`  ${n}: ${html.includes(n)}`);
  }
}

check("out/index.html", [
  "guestybookings",
  "guestyowners",
  "nelsontasman",
  "/images/brand/",
  "Book Now",
  "Owner Login",
  "Emergency Information",
]);
check("out/explore-golden-bay/index.html", [
  "doc.govt.nz",
  "/images/explore/",
  "Visit website",
]);
check("out/blog/dog-friendly-golden-bay/index.html", [
  "Milnthorpe",
  "/images/blog/dog-friendly",
]);
check("out/contact-and-support/index.html", [
  "9:00 am",
  "24/7",
  "dial 111",
]);
