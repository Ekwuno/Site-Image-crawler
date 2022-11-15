import fetch from "node-fetch";
import * as cheerio from "cheerio";
import * as fs from "fs"; // write to filesystem... We can use this to add downloaded images to a file
import * as path from "path";
import * as urlParser from "url";

const checkURL = (link: string) => {
	// Check that each link you are crawlling is appendable
	if (link.includes(`http`)) {
		return link;
	} else if (link.startsWith("/")) {
		return `http://localhost:10000${link}`;
	} else {
		return `http://localhost:10000/${link}`;
	}
};

const seenURL: any = {};

const crawl = async ({ url }: any) => {
	if (seenURL[url]) return;
	console.log("crawling", url);
	seenURL[url] = true;
	const response = await fetch(url);
	const html = await response.text();
	// console.log("html", html);

	const $ = cheerio.load(html); // This creates an object that we can use to parse the informatio we get back
	//1. Using cheerio to loop over anchor tags(this can be anything you want) and create an array of all the links on the URL you are crawling
	const links = $("a")
		.map((i, link) => link.attribs.href)
		.get();

	//2. Using cheerio to get all images will be similar to the logic above
	const imagesURLs = $("img")
		.map((i, link) => link.attribs.src)
		.get();

	imagesURLs.forEach((imageURL) => {
		fetch(checkURL(imageURL)).then((response) => {
			const filename = path.basename(imageURL);
			const dest = fs.createWriteStream(`${filename}`); // Add distination 
			response.body.pipe(dest);
		});
	});

	console.log(links);
	console.log("images", imagesURLs);

	const { host }:any = urlParser.parse(url);

	links
		.filter((link) => link.includes(host))
		.forEach((link) => {
			crawl({
				url: checkURL(link),
			});
		});
};

crawl({
	url: "", // Add Site URL here
});
