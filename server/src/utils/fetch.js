import nodeFetch from "node-fetch";

export default async function fetchWrap(url, options = {}) {
    return nodeFetch(url, {
        timeout: 10000,
        ...options
    });
}
