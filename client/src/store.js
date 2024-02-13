import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const UseNewsStore = create(
  devtools(
    (set) => ({
      //  Initial State here
      allNewsData: [],
      allTickers: [],

      //   Filtered Data in this
      filteredData: [],
      filteredDataofTandF: [],

      // FILTERED TICKERS IN THIS
      filteredTickerData: [],

      // BUSINESS WIRE DATA
      businessWireData: [],

      // PR NEWS WIRE DATA
      prNewsWireData: [],

      // ACCESS WIRE DATA
      accessWireData: [],

      // GLOBE NEWS WIRE DATA
      globeNewsWireData: [],

      // NEWS FILE DATA
      newsFileData: [],

      // SETTING FILTERED DATA HERE
      setFilteredData: (data) => set({ filteredData: data }),
      setFilteredDataTandF: (data) => set({ filteredDataofTandF: data }),
      setTickerFilteredData: (data) => set({ filteredTickerData: data }),

      // SETTING ALL DATA HERE
      setAllNewsData: (data) => set({ allNewsData: data }),

      // SETTING ALL TICKERS
      setAllTickers: (data) => set({ allTickers: data }),
      
      // SETTING BUSINESSWIRE DATA
      setBusinessWireData: (data) => set({ businessWireData: data}),
      
      // SETTING PRNEWSWIRE DATA
      setPRNewsWireData: (data) => set({ prNewsWireData: data}),
      
      // SETTING ACCESSWIRE DATA
      setAccessWireData: (data) => set({ accessWireData: data}),
      
      // SETTING GLOBENEWSWIRE DATA
      setGlobeNewsWireData: (data) => set({ globeNewsWireData: data}),
      
      // SETTING NEWS FILE DATA
      setNewsFileData: (data) => set({ newsFileData: data}),

    }),
    "NewsStore"
  )
);
