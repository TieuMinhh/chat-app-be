import axios from 'axios';
import * as cheerio from 'cheerio';

export interface LinkMetadata {
  title?: string;
  description?: string;
  image?: string;
  url: string;
  siteName?: string;
}

export const getLinkMetadata = async (url: string): Promise<LinkMetadata | null> => {
  try {
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const $ = cheerio.load(response.data as string);

    const metadata: LinkMetadata = {
      url,
      title: $('meta[property="og:title"]').attr('content') || $('title').text(),
      description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content'),
      image: $('meta[property="og:image"]').attr('content'),
      siteName: $('meta[property="og:site_name"]').attr('content'),
    };

    return metadata;
  } catch (error) {
    console.error(`Error fetching metadata for ${url}:`, error);
    return null;
  }
};

export const extractUrls = (text: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};
