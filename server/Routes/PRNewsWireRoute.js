const express = require("express");
const Router = express.Router();
const PRNewsWireSchema = require("../Schema/PRNewsWireModel");
const puppeteer = require("puppeteer");
const moment = require("moment");
const emailSent = require("../utils/emailSent");
const { format, subDays, parse } = require("date-fns");
const filterDays = require("../utils/filterDays");
const { v4: uuidv4 } = require("uuid");

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
      "Rosen",
    ];

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setCacheEnabled(false);

    const firmData = [];

    for (let i = 0; i < law_firms.length; i++) {
      const firm = law_firms[i];
      const encodedFirm = encodeURI(firm);
      const prNewsUrl = `https://www.prnewswire.com/news/${encodedFirm}/`;
      await page.goto(prNewsUrl, {
        waitUntil: "domcontentloaded",
        timeout: 300000,
      });
      await page.waitForSelector(".card-list .newsCards", { timeout: 300000 });

      var newsItems = await page.$$eval(".card-list .newsCards", (items) => {
        return items
          .map((item) => {
            const title = item
              .querySelector("h3 small")
              ?.nextSibling?.textContent.trim();
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
      });

      const payload = newsItems
        .map((newsItem) => {
          const tickerMatch =
            newsItem.summary.match(/\((NASDAQ|NYSE|OTCBB):([^\)]+)\)/) ||
            newsItem.title.match(/\((NASDAQ|NYSE|OTCBB):([^\)]+)\)/);
          const tickerSymbolMatch = (
            tickerMatch ? tickerMatch[2].trim() : ""
          ).match(/([^;\s]+)/);
          const formattedDate = moment(newsItem.date, [
            "MMM DD, YYYY",
            "MMM DD, YYYY h:mm A",
          ]).format("MMMM DD, YYYY");
          const id = uuidv4();
          // Check if tickerSymbol is not empty before adding to payload
          if (tickerSymbolMatch && tickerSymbolMatch[1]) {
            return {
              scrapId: id,
              tickerSymbol: tickerSymbolMatch[1], // Extracted first ticker symbol
              firmIssuing: law_firms[i],
              serviceIssuedOn: "PR Newswire", // Replace with actual service
              dateTimeIssued: formattedDate, // Use the current date and time
              urlToRelease: `https://www.prnewswire.com${newsItem.link}`,
              tickerIssuer:
                newsItem.summary.includes("(NASDAQ:") ||
                newsItem.title.includes("(NASDAQ:")
                  ? "NASDAQ"
                  : newsItem.summary.includes("(NYSE:") ||
                    newsItem.title.includes("(NYSE:")
                  ? "NYSE"
                  : newsItem.summary.includes("(OTCBB:") ||
                    newsItem.title.includes("(OTCBB:")
                  ? "OTCBB"
                  : "",
            };
          } else {
            return null; // Skip items with empty tickerSymbol
          }
        })
        .filter(Boolean); // Remove null entries

      for (const newsData of payload) {
        // const newNews = new PRNewsWireSchema(newsData);
        // await newNews.save();
        firmData.push({ firm: listed_firms[i], payload: newsData });
      }
    }

    /* firmData.push({
      firm: "Berger Montague",
      payload: {
        scrapId: uuidv4(),
        tickerSymbol: "SERV",
        firmIssuing: "Berger Montague",
        serviceIssuedOn: "BusinessWire",
        dateTimeIssued: "January 02, 2024",
        urlToRelease:
          "http://www.businesswire.com/news/home/20240101367342/zh-HK/",
        tickerIssuer: "NYSE",
      },
    });

    firmData.push({
      firm: "Rosen",
      payload: {
        scrapId: uuidv4(),
        tickerSymbol: "BIDU",
        firmIssuing: "Berger Montague",
        serviceIssuedOn: "BusinessWire",
        dateTimeIssued: "January 05, 2024",
        urlToRelease:
          "http://www.businesswire.com/news/home/20240101367342/zh-HK/",
        tickerIssuer: "NYSE",
      },
    }); */
    console.log("FirmData_Before:", firmData.length);

    // Search news details 75 days before the current date and remove before 75 days news details

    const dateToCompare = filterDays(firmData);

    firmData?.forEach(function (newsDetails, index) {
      const allPRNewsDate = new Date(newsDetails?.payload.dateTimeIssued);

      if (dateToCompare > allPRNewsDate) {
        firmData.splice(index, 1);
      }
    });

    console.log("FirmData_After:", firmData.length);

    const getAllPRNewsWire = await PRNewsWireSchema.find();
    emailSent(req, res, getAllPRNewsWire, firmData, PRNewsWireSchema);

    await browser.close();
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Delete PRNewsWire

Router.delete("/deleteall", async (req, res) => {
  PRNewsWireSchema.deleteMany({})
    .then((data) => {
      data === null
        ? res.send({
            message: "News already deleted",
          })
        : res.send({
            message: "News deleted successfully",
          });
    })
    .catch((err) => {
      res.send(err);
    });
});

module.exports = Router;
