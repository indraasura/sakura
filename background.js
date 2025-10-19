// control extension lifecycle and toggles

chrome.runtime.onInstalled.addListener(() => {
    console.log("Surfboard extension installed")
})