import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const UseNewsStore = create(
  devtools(
    (set) => ({
      //  Initial State here
      firmData: [],
      allNewsData: [],

      // Initial State for Tickers

      NASDAQData: [],
      NYSEData: [],
      OTCBBData: [],

      //   Filtered Data in this
      filteredData: [],
      filteredDataofTandF: [],

      // FILTERED TICKER SYMBOL IN THIS

      filteredNASDAQData: [],
      filteredOTCBBData: [],
      filteredNYSEData: [],

      // SETTING FILTERED DATA HERE
      setFilteredData: (data) => set({ filteredData: data }),
      setFilteredDataTandF: (data) => set({ filteredDataofTandF: data }),

      // SETTING ALL DATA HERE
      setAllNewsData: (data) => set({ allNewsData: data }),

      // SETTING ALL DATA OF DIFFERENT DIFFERENT TICKERS
      setFilteredNASDAQ: (data) => set({ filteredNASDAQData: data }),
      setFilteredOTCBB: (data) => set({ filteredOTCBBData: data }),
      setFilteredNYSE: (data) => set({ filteredNYSEData: data }),

      // SETTING ALL FILTERED DATA OF TICKER SYMBOL
      setNYSEData: (data) => set({ NYSEData: data }),
      setNASDAQData: (data) => set({ NASDAQData: data }),
      setOTCBBData: (data) => set({ OTCBBData: data }),

      // SETTING FIRM DATA
      setFirmData: (data) => set({ firmData: data }),
    }),
    "NewsStore"
  )
);
