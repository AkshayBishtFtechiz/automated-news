const puppeteer = require("puppeteer");
const AccessWireSchema = require("../Schema/AccessWireModel");
const { filterDays } = require("../utils/filterDays");
const emailSent = require("../utils/emailSent");
const moment = require("moment");

// Function to introduce a delay using setTimeout
function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

exports.getAllAccessWire = async (req, res) => {
  const { flag } = req.body;
  console.log("Coming_InsidePR", req.body);

  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.setCacheEnabled(false);
    await page.goto("https://www.accesswire.com/newsroom", { timeout: 900000 });

    await page.waitForSelector("#topics", { timeout: 0 });

    // Introduce a 2-second delay (adjust as needed)
    await delay(100);

    await page.select("#topics", "Class Action");

    await page.waitForSelector(".html-embed-21.w-embed");

    const titles = await page.$$eval(".articletitle", (titleElements) => {
      return titleElements.map((titleElement) => {
        return titleElement.textContent.trim();
      });
    });

    const firmIssuers = [
      "Levi & Korsinsky",
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
      "Rosen",
      "Edelson Lechtzin LLP",
      "M&A Class Action Firm",
    ];

    function getMatchingFirmIssuer(title, firmIssuers) {
      const lowercasedTitle = title.toLowerCase();
      for (const firm of firmIssuers) {
        if (lowercasedTitle.includes(firm.toLowerCase())) {
          return firm; // Return the matching firm issuer
        }
      }
      return null; // Return null if no match found
    }

    const payload = await page.$$eval(".box-words", (newsItems) => {
      return newsItems.map((newsItem) => {
        const urlToRelease =
          newsItem
            .querySelector(".articletitle")
            ?.getAttribute("href")
            .trim() || "";
        const dateTimeIssued =
          newsItem.querySelector(".article-date")?.textContent.trim() || "";
        const formattedDateTimeIssued = moment(
          dateTimeIssued,
          "MMMM DD, YYYY h:mm A"
        ).format("MMMM DD, YYYY");
        const description = newsItem
          .querySelector(".html-embed-21.w-embed")
          ?.textContent.trim();

        const tickerIssuer = (() => {
          if (description?.includes("(NASDAQ:")) {
            return "NASDAQ";
          } else if (description?.includes("(NYSE:")) {
            return "NYSE";
          } else if (description?.includes("(OTCBB:")) {
            return "OTCBB";
          } else {
            return "";
          }
        })();

        const tickerMatch = description?.match(
          /\((NASDAQ|NYSE|OTCBB):([^\)]+)\)/
        );

        function generateRandomUuid() {
          const randomHex = () =>
            Math.floor(Math.random() * 256)
              .toString(16)
              .padStart(2, "0");

          return (
            randomHex() +
            randomHex() +
            randomHex() +
            randomHex() +
            "-" +
            randomHex() +
            randomHex() +
            "-" +
            randomHex() +
            randomHex() +
            "-" +
            randomHex() +
            randomHex() +
            "-" +
            randomHex() +
            randomHex() +
            randomHex() +
            randomHex() +
            randomHex() +
            randomHex()
          ).toLowerCase();
        }

        const randomUuid = generateRandomUuid();
        return {
          scrapId: randomUuid,
          tickerSymbol: tickerMatch ? tickerMatch[2].trim() : "",
          serviceIssuedOn: "AccessWire",
          dateTimeIssued: formattedDateTimeIssued,
          urlToRelease,
          tickerIssuer: tickerIssuer ? tickerIssuer : "",
        };
      });
    });

    const finalPayload = payload
      .map((item, index) => ({
        firm:
          getMatchingFirmIssuer(titles[index], firmIssuers) ||
          "Levi & Korsinsky",
        payload: {
          scrapId: item.scrapId,
          tickerSymbol: item.tickerSymbol,
          firmIssuing:
            getMatchingFirmIssuer(titles[index], firmIssuers) ||
            "Levi & Korsinsky",
          serviceIssuedOn: item.serviceIssuedOn,
          dateTimeIssued: item.dateTimeIssued,
          urlToRelease: item.urlToRelease,
          tickerIssuer: item.tickerIssuer,
        },
      }))
      .filter(
        (item) =>
          item.payload.tickerSymbol !== "" || item.payload.tickerIssuer !== ""
      );

    // JSON FOR NEW TICKER

    // finalPayload.push({
    //   firm: "Berger Montague",
    //   payload: {
    //     scrapId: "86222b40-518e-4370-9c32-94e5dd0d270e",
    //     tickerSymbol: "NEWTICKER", // NEW TICKER THAT COMES
    //     firmIssuing: "Berger Montague",
    //     serviceIssuedOn: "Accesswire",
    //     dateTimeIssued: "January 19, 2024",
    //     urlToRelease:
    //       "https://www.accesswire.com/viewarticle.aspx?id=826383&lang=en",
    //     tickerIssuer: "NYSE",
    //   },
    // });

    try {
      const { targetDate, formattedTargetDate } = filterDays(75);
      const last75DaysData = finalPayload.filter((newsDetails) => {
        const allAccessWireNewsDate = moment(
          newsDetails?.payload.dateTimeIssued,
          "MMMM DD, YYYY"
        );
        return targetDate < allAccessWireNewsDate;
      });
      const getAllAccessWireNews = await AccessWireSchema.find();
      emailSent(
        req,
        res,
        getAllAccessWireNews,
        last75DaysData,
        AccessWireSchema,
        flag
      );
      await browser.close();
    } catch (error) {
      console.error("Error:", error);
      {
        flag !== true && (
          res.status(500).send("Internal Server Error"))
      }
    }
  } catch (error) {
    console.error("Error:", error);
    {
      flag !== true && (
        res.status(500).send("Internal Server Error"))
    }
  }
};

// Delete Access Wire News
exports.deleteAccessWireAll = async (req, res) => {
  AccessWireSchema.deleteMany({})
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
