const express = require("express");
const Router = express.Router();
const BusinessWireSchema = require("../Schema/BusinessWireModel");
const puppeteer = require("puppeteer");
const moment = require("moment");
const cheerio = require("cheerio");
const axios = require("axios");

// BUSINESS WIRE API

Router.get("/", async (req, res) => {
  try {
    const law_firms = [
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
      "Rosen",
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

    const { days } = req?.query;

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setCacheEnabled(false);

    const firmData = [];

    for (let i = 0; i < law_firms.length; i++) {
      const firm = law_firms[i];
      const encodedFirm = encodeURI(firm);
      const businessWireUrl = `https://www.businesswire.com/portal/site/home/search/?searchType=all&searchTerm=${encodedFirm}&searchPage=1`;
      await page.goto(businessWireUrl, { waitUntil: "domcontentloaded" });
      await page.waitForSelector(".bw-news-section li");

      const newsItems = await page.$$eval(".bw-news-section li", (items) => {
        return items
          .map((item) => {
            const title = item.querySelector("h3 a").textContent.trim();
            const date = item
              .querySelector(".bw-news-meta time")
              .textContent.trim();
            const link = item.querySelector("h3 a").getAttribute("href");
            const summary = item.querySelector("p").textContent.trim();

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
              item.summary.includes("(OTCBB:")
            );
          });
      });

      const payload = newsItems.map((newsItem) => {
        return {
          tickerSymbol: newsItem.summary.includes("(NASDAQ:")
            ? "NASDAQ"
            : newsItem.summary.includes("(NYSE:")
            ? "NYSE"
            : newsItem.summary.includes("(OTCBB:")
            ? "OTCBB"
            : "",
          firmIssuing: law_firms[i],
          serviceIssuedOn: "BusinessWire", // Replace with actual service
          dateTimeIssued: newsItem.date, // Use the current date and time
          urlToRelease: newsItem.link,
        };
      });

      if (days) {
        const filteredData = payload.filter((newsData) => {
          const entryDate = new Date(newsData.dateTimeIssued);
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - parseInt(days, 10));
          return entryDate >= cutoffDate;
        });

        // Save each document separately
        for (const newsData of filteredData) {
          // const newNews = new BusinessWireSchema(newsData);
          // await newNews.save();
          firmData.push({ firm, payload: newsData });
        }
      } else {
        for (const newsData of payload) {
          firmData.push({ firm: listed_firms[i], payload: newsData });
          // const newNews = new BusinessWireSchema(newsData);
          // await newNews.save();
        }
      }
    }

    res.json(firmData);
    await browser.close();
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = Router;
