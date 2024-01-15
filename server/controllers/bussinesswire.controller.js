const express = require("express");
const Router = express.Router();
const BusinessWireSchema = require("../Schema/BusinessWireModel");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const axios = require("axios");
const nodemailer = require("nodemailer");
const emailSent = require("../utils/emailSent");
const filterDays = require("../utils/filterDays");
const { v4: uuidv4 } = require("uuid");

// BUSINESS WIRE API

exports.getAllBussinessWire = async (req, res) => {
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
      "Rosen",
    ];

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setCacheEnabled(false);

    let firmData = [];

    for (let i = 0; i < law_firms.length; i++) {
      const firm = law_firms[i];
      const encodedFirm = encodeURI(firm);
      const businessWireUrl = `https://www.businesswire.com/portal/site/home/search/?searchType=all&searchTerm=${encodedFirm}&searchPage=1`;
      await page.goto(businessWireUrl, {
        waitUntil: "domcontentloaded",
        timeout: 300000,
      });
      await page.waitForSelector(".bw-news-section li", { timeout: 300000 });

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
        const tickerMatch = newsItem.summary.match(
          /\((NASDAQ|NYSE|OTCBB):([^\)]+)\)/
        );
        const id = uuidv4();

        return {
          scrapId: id,
          tickerSymbol: tickerMatch ? tickerMatch[2].trim() : "",
          firmIssuing: law_firms[i],
          serviceIssuedOn: "BusinessWire", // Replace with actual service
          dateTimeIssued: newsItem.date, // Use the current date and time
          urlToRelease: newsItem.link,
          tickerIssuer: newsItem.summary.includes("(NASDAQ:")
            ? "NASDAQ"
            : newsItem.summary.includes("(NYSE:")
              ? "NYSE"
              : newsItem.summary.includes("(OTCBB:")
                ? "OTCBB"
                : "",
        };
      });

      for (const newsData of payload) {
        firmData.push({ firm: listed_firms[i], payload: newsData });
      }
    }

    // firmData.push({
    //   firm: "Berger Montague",
    //   payload: {
    //     scrapId: uuidv4(),
    //     tickerSymbol: "JDNX",
    //     firmIssuing: "Berger Montague",
    //     serviceIssuedOn: "BusinessWire",
    //     dateTimeIssued: "January 15, 2024",
    //     urlToRelease:
    //       "http://www.businesswire.com/news/home/20240101367342/zh-HK/",
    //     tickerIssuer: "NYSE",
    //   },
    // });

    // firmData.push({
    //   firm: "Rosen",
    //   payload: {
    //     scrapId: uuidv4(),
    //     tickerSymbol: "NEW2",
    //     firmIssuing: "Berger Montague",
    //     serviceIssuedOn: "BusinessWire",
    //     dateTimeIssued: "January 11, 2024",
    //     urlToRelease:
    //       "http://www.businesswire.com/news/home/20240101367342/zh-HK/",
    //     tickerIssuer: "NYSE",
    //   },
    // });

    firmData.push({
      firm: "Rosen",
      payload: {
        scrapId: uuidv4(),
        tickerSymbol: "UNINOR",
        firmIssuing: "Berger Montague",
        serviceIssuedOn: "BusinessWire",
        dateTimeIssued: "January 15, 2024",
        urlToRelease:
          "http://www.businesswire.com/news/home/20240101367342/zh-HK/",
        tickerIssuer: "NYSE",
      },
    });

    // Search news details 75 days before the current date and remove before 75 days news deyails

    const dateToCompare = filterDays(firmData);

    firmData?.forEach(function (newsDetails, index) {
      const allPRNewsDate = new Date(newsDetails?.payload.dateTimeIssued);

      if (dateToCompare > allPRNewsDate) {
        firmData.splice(index, 1);
      }
    });

    const getAllBussinessNews = await BusinessWireSchema.find();
    emailSent(req, res, getAllBussinessNews, firmData, BusinessWireSchema);

    await browser.close();
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Delete BussinessWireNews

exports.deleteBussinessAll = async (req, res) => {
  BusinessWireSchema.deleteMany({})
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
};