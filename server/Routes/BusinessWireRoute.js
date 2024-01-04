const express = require("express");
const Router = express.Router();
const BusinessWireSchema = require("../Schema/BusinessWireModel");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const axios = require("axios");
const nodemailer = require("nodemailer");

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
      "Rosen",
    ];

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
        const tickerMatch = newsItem.summary.match(
          /\((NASDAQ|NYSE|OTCBB):([^\)]+)\)/
        );

        return {
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
        // const newNews = new BusinessWireSchema(newsData);
        // await newNews.save();
      }
    }

    const getAllBussinessNews = await BusinessWireSchema.find();
    console.log("getAllBussinessNews@@:", getAllBussinessNews);

    if (getAllBussinessNews.length === 0) {
      firmData.forEach(async function (data, index) {
        const newResponse = data.payload;
        const newNews = new BusinessWireSchema(newResponse);
        newNews.save();
      });
      res.json(firmData);
    } else if (getAllBussinessNews.length !== firmData.length) {
      firmData.forEach(async function (data, index) {
        const newResponse = data.payload;

        //const releaseUrl = newResponse.urlToRelease;
        if (
          getAllBussinessNews.length > 0 &&
          getAllBussinessNews[index].urlToRelease !==
            data[index].payload.urlToRelease
        ) {
          firmData.push({ payload: data[index].payload });
          /* const newNews = new BusinessWireSchema(newResponse);
          newNews.save(); */
        }
      });
        const newNews = new BusinessWireSchema(firmData);
        newNews.save();
      res.json(firmData);
    } else {
      res.send({
        message: "Duplicate News",
      });
    }

    
    await browser.close();
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});


Router.delete("/deleteall", async (req, res) => {
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
});

Router.post("/sendemail", (req, res) => {
  // send email
  // Create a transporter using SMTP transport
  const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'automatednews21@gmail.com',
        pass: 'ovig lcvq nfdn whsj'
    },
    secure: false, // use SSL
    port: 25, // port for secure SMTP
    tls: {
      rejectUnauthorized: false
  }
  });
  
  // Define the email options
  const mailOptions = {
      from: 'automatednews21@gmail.com',  // Sender address
      to: 'shubham.pal@ftechiz.com',   // List of recipients
      subject: 'Hello from Nodemailer',  // Subject line
      text: 'Hello, this is a test email!'  // Plain text body
  };
  
  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.send(error)
      return console.error('Error:', error.message);
      }
    console.log('Email sent:', info.response);
    res.send({
      message:"Email sent"
    })
  });
  

});

module.exports = Router;
