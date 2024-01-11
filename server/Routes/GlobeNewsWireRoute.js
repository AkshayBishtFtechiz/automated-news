const express = require("express");
const Router = express.Router();
const GlobeNewsWireSchema = require("../Schema/GlobeNewsWireModel");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const moment = require("moment");
const emailSent = require("../utils/emailSent");
const filterDays = require("../utils/filterDays");
const { v4: uuidv4 } = require('uuid');

// GLOBE NEWS WIRE API

Router.get("/", async (req, res) => {
  try {
    const law_firms = [
      "Berger%20Montague",
      "Bernstein%20Liebhard%20LLP",
      "Bronsteinδ%20Gewirtz%20&%20Grossmanδ%20LLC",
      "Faruqi%20&%20Faruqi%20LLP",
      //   "Grabar",
      "Hagens%20Berman%20Sobol%20Shapiro%20LLP",
      "Kessler%20Topaz%20Meltzer%20&%20Check%20LLP",
      "Pomerantz%20LLP",
      "Rigrodsky%20Lawδ%20P§A",
      "Schall%20Law",
      "Kaskela%20Law",
      "Glancy%20Prongay%20&%20Murray%20LLP",
      "Levi%20&%20Korsinskyδ%20LLP",
      "The%20Rosen%20Law%20Firm%20PA",
    ];

    const listed_firms = [
      "Berger Montague",
      "Bernstein Liebhard",
      "Bronstein, Gewirtz",
      "Faruqi & Faruqi",
      // "Grabar",
      "Hagens Berman",
      "Kessler Topaz",
      "Pomerantz",
      "Rigrodsky",
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
      const globeNewsWireUrl = `https://www.globenewswire.com/en/search/organization/${encodedFirm}?page=1`;
      await page.goto(globeNewsWireUrl, { waitUntil: "domcontentloaded",timeout:120000 });
      await page.waitForSelector(".pagging-list-item",{timeout:120000});

      const htmlContent = await page.content();
      const $ = cheerio.load(htmlContent);

      const firmNewsItems = $(".pagging-list-item")
        .map((index, element) => {
          const $item = $(element);
          const title = $item.find('[data-autid="article-url"]').text();
          const date = $item
            .find('[data-autid="article-published-date"]')
            .text();
          const link = $item.find('[data-autid="article-url"]').attr("href");
          const summary = $item.find('[data-autid="article-summary"]').text();

          return {
            title,
            date,
            link,
            summary,
          };
        })
        .get(); // Convert to an array

      const filteredNewsItems = firmNewsItems.filter((item) => {
        return (
          item.summary.includes("(NASDAQ:") ||
          item.summary.includes("(NYSE:") ||
          item.summary.includes("(OTCBB:") ||
          item.title.includes("(NASDAQ:") ||
          item.title.includes("(NYSE:") ||
          item.title.includes("(OTCBB:")
        );
      });

      const payload = filteredNewsItems.map((newsItem) => {
        const tickerMatch =
          newsItem.summary.match(/\((NASDAQ|NYSE|OTCBB):([^\)]+)\)/) ||
          newsItem.title.match(/\((NASDAQ|NYSE|OTCBB):([^\)]+)\)/);
        const tickerSymbolMatch = (tickerMatch ? tickerMatch[2].trim() : "").match(/([^;\s]+)/)
        const formattedDate = moment(newsItem.date, ["MMM DD, YYYY", "MMM DD, YYYY h:mm A"]).format("MMMM DD, YYYY");
        const id = uuidv4();
        return {
          scrapId: id,
          tickerSymbol: tickerSymbolMatch ? tickerSymbolMatch[1] : "", // Extracted first ticker symbol
          firmIssuing: law_firms[i],
          serviceIssuedOn: "Globe News Wire", // Replace with actual service
          dateTimeIssued: formattedDate, // Use the current date and time
          urlToRelease: `https://www.globenewswire.com${newsItem.link}`,
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
      });

      // Save each document separately
      for (const newsData of payload) {
        firmData.push({ firm: listed_firms[i], payload: newsData });
      }
    }

    /* firmData.push({
      firm: "Berger Montague",
      payload: {
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
        tickerSymbol: "BIDU",
        firmIssuing: "Berger Montague",
        serviceIssuedOn: "BusinessWire",
        dateTimeIssued: "January 02, 2024",
        urlToRelease:
          "http://www.businesswire.com/news/home/20240101367342/zh-HK/",
        tickerIssuer: "NYSE",
      },
    }); */

    console.log("FirmData_Before:", firmData.length);

    // Search news details 75 days before the current date and remove before 75 days news deyails
    
    const dateToCompare = filterDays(firmData);

    console.log("FirmData_Before:", firmData.length);

        firmData?.forEach(function (newsDetails, index) {
          const allPRNewsDate = new Date(newsDetails?.payload.dateTimeIssued);
          
          if (dateToCompare > allPRNewsDate) {
            firmData.splice(index, 1);
          }
        });
    
    console.log("FirmData_After:", firmData.length);
    
    const getAllGlobeNewsWire = await GlobeNewsWireSchema.find();
    emailSent(req, res, getAllGlobeNewsWire, firmData, GlobeNewsWireSchema);

    await browser.close();
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Delete GlobeWireNews

Router.delete("/deleteall", async (req, res) => {
  GlobeNewsWireSchema.deleteMany({})
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
