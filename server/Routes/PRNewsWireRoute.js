const express = require("express");
const Router = express.Router();
const PRNewsWireSchema = require("../Schema/PRNewsWireModel");
const puppeteer = require("puppeteer");

// PR NEWS WIRE API
Router.get("/", async (req, res) => {
  try {
    const law_firms = [
      "berger-montague",
      "bernstein-liebhard-llp",
      "bronstein,-gewirtz-&-grossman,-llc",
      "faruqi-&-faruqi,-llp",
      "hagens-berman-sobol-shapiro-llp",
      "kessler-topaz-meltzer-&-check,-llp",
      "pomerantz-llp",
      "the-schall-law-firm",
      "kaskela-law-llc",
      "glancy-prongay-&-murray-llp",
      "levi-&-korsinsky,-llp",
      "the-rosen-law-firm,-p.-a.",
    ];

    const listed_firms = [
      "Berger Montague",
      "Bernstein Liebhard",
      "Bronstein, Gewirtz",
      "Faruqi & Faruqi",
      "Hagens Berman",
      "Kessler Topaz",
      "Pomerantz",
      "Schall",
      "Kaskela",
      "Glancy",
      "Levi & Korsinsky",
      "Rosen"
    ]

    const browser = await puppeteer.launch({headless:'new'});
    const page = await browser.newPage();
    await page.setCacheEnabled(false);

    const firmData = [];

    for (let i = 0; i < law_firms.length; i++) {
      const firm = law_firms[i];
      const encodedFirm = encodeURI(firm);
      const prNewsUrl = `https://www.prnewswire.com/news/${encodedFirm}/`;
      await page.goto(prNewsUrl, { waitUntil: "domcontentloaded" });
      await page.waitForSelector(".card-list .newsCards");

      var newsItems = await page.$$eval(
        ".card-list .newsCards",
        (items) => {
          return items
            .map((item) => {
              const title = item.querySelector("h3 small")?.nextSibling?.textContent.trim();
              const date = item.querySelector("h3 small")?.textContent.trim();
              const link = item.querySelector("a")?.getAttribute("href");
              const summary = item.querySelector("p")?.textContent.trim();

              return {
                title,
                date,
                link,
                summary,
              };
            })
            .filter((item) => {
              return (
                item.summary.includes("(NASDAQ:") ||
                item.summary.includes("(NYSE:") ||
                item.summary.includes("(OTCBB:") ||
                item.title.includes("(NASDAQ:") ||
                item.title.includes("(NYSE:") ||
                item.title.includes("(OTCBB:")
              );
            });
        }
      );

      const payload = newsItems.map((newsItem) => {
        return {
          tickerSymbol: newsItem.summary.includes("(NASDAQ:") || newsItem.title.includes("(NASDAQ:")
            ? "NASDAQ"
            : newsItem.summary.includes("(NYSE:") || newsItem.title.includes("(NYSE:")
            ? "NYSE"
            : newsItem.summary.includes("(OTCBB:") || newsItem.title.includes("(OTCBB:")
            ? "OTCBB"
            : "",
          firmIssuing: firm,
          serviceIssuedOn: "PR Newswire", // Replace with actual service
          dateTimeIssued: newsItem.date, // Use the current date and time
          urlToRelease: `https://www.prnewswire.com${newsItem.link}`,
        };
      });

      for (const newsData of payload) {
        // const newNews = new PRNewsWireSchema(newsData);
        // await newNews.save();
        firmData.push({ firm: listed_firms[i], payload: newsData });
      }
    }

    res.send(firmData);

    await browser.close();
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});


module.exports = Router;
