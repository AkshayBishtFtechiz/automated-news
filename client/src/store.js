import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const UseNewsStore = create(
  devtools(
    (set) => ({
      //  Initial State here
      firmData: [],
      allNewsData: [],
      allTickers: [],
      tickerCountArray: [],
      tickerCounts: [],

      //   Filtered Data in this
      filteredData: [],
      filteredDataofTandF: [],

      // FILTERED TICKERS IN THIS
      filteredTickerData: [],

      // SETTING FILTERED DATA HERE
      setFilteredData: (data) => set({ filteredData: data }),
      setFilteredDataTandF: (data) => set({ filteredDataofTandF: data }),
      setTickerFilteredData: (data) => set({filteredTickerData: data}),

      // SETTING ALL DATA HERE
      setAllNewsData: (data) => set({ allNewsData: data }),

      // SETTING FIRM DATA
      setFirmData: (data) => set({ firmData: data }),

      // SETTING ALL TICKERS
      setAllTickers: (data) => set({ allTickers: data }),
      setTickerCountArray: (data) => set({ tickerCountArray: data }),
      setTickerCounts: (data) => set({ tickerCounts: data }),
    }),
    "NewsStore"
  )
);
