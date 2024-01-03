const express = require("express");
const Router = express.Router();
const NewsFileSchema = require("../Schema/NewsFileModel");
const puppeteer = require("puppeteer");

// NEWS FILE API
Router.get("/", async (req, res) => {
  try {
    const law_firms = [
        {
            index: 7427,
            name: "Berger-Montague"
        },
        {
            index: 6535,
            name: "Bernstein-Liebhard-LLP"
        },
        {
            index: 7130,
            name: "Bronstein-Gewirtz-Grossman-LLC"
        },
        {
            index: 6455,
            name: "Faruqi-Faruqi-LLP"
        },
        {
            index: 8797,
            name: "Grabar-Law-Office"
        },
        {
            index: 7059,
            name: "Hagens-Berman-Sobol-Shapiro-LLP"
        },
        {
            index: 7699,
            name: "Kessler-Topaz-Meltzer-Check-LLP"
        },
        {
            index: 7611,
            name: "Pomerantz-LLP"
        },
        {
            index: 8569,
            name: "Rigrodsky-Law-P.A."
        },
        {
            index: 6640,
            name: "Schall-Law-Firm"
        },
        {
            index: 7815,
            name: "Kaskela-Law-LLC"
        },
        {
            index: 9378,
            name: "Glancy-Prongay-Murray-LLP"
        },
        {
            index: 7091,
            name: "Levi-Korsinsky-LLP"
        },
        {
            index: 7397,
            name: "The-Rosen-Law-Firm-PA"
        },
    ];

    const listed_firms = [
      "Berger Montague",
      "Bernstein Liebhard",
      "Bronstein, Gewirtz",
      "Faruqi & Faruqi",
      "Grabar",
      "Hagens Berman",
      "Kessler Topaz",
      "Pomerantz",
      "Rigrodsky",
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
      const newsFilesUrl = `https://www.newsfilecorp.com/company/${firm.index}/${firm.name}`;
      await page.goto(newsFilesUrl, { waitUntil: "domcontentloaded" });
      await page.waitForSelector(".latest-news.no-images li");

      var newsItems = await page.$$eval(
        ".latest-news.no-images li",
        (items) => {
          return items
            .map((item) => {
              const title = item.querySelector("div.ln-description a.ln-title")?.textContent.trim();
              const date = item.querySelector("div.ln-description span.date")?.textContent.trim();
              const link = item.querySelector("div.ln-description a.ln-title")?.getAttribute("href");
              const summary = item.querySelector("div.ln-description p")?.textContent.trim();

              return {
                title,
                date,
                link,
                summary,
              };
            })
            .filter((item) => {
              return (
                item?.summary?.includes("(NASDAQ:") ||
                item?.summary?.includes("(NYSE:") ||
                item?.summary?.includes("(OTCBB:")
              );
            });
        }
      );

      const payload = newsItems.map((newsItem) => {
        return {
          tickerSymbol: newsItem.summary.includes("(NASDAQ:")
            ? "NASDAQ"
            : newsItem.summary.includes("(NYSE:")
            ? "NYSE"
            : newsItem.summary.includes("(OTCBB:")
            ? "OTCBB"
            : "",
          firmIssuing: firm.name,
          serviceIssuedOn: "News File Corp", // Replace with actual service
          dateTimeIssued: newsItem.date, // Use the current date and time
          urlToRelease: `https://www.newsfilecorp.com/${newsItem.link}`,
        };
      });

      for (const newsData of payload) {
        // const newNews = new NewsFileSchema(newsData);
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
