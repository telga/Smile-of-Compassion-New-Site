const VIETNAMESE_RE =
  /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;

const GENERIC_OG_TITLES = [
  'facebook',
  'log in or sign up to view',
  'dự án nụ-cười nhân-ái',
  'du an nu-cuoi nhan-ai',
];

export function isFacebookUrl(value) {
  try {
    const parsed = new URL(value.trim());
    const host = parsed.hostname.replace(/^www\./, '').replace(/^m\./, '').replace(/^web\./, '');
    return host === 'facebook.com' || host === 'fb.com' || host === 'fb.watch' || host.endsWith('.facebook.com');
  } catch {
    return false;
  }
}

export function stripEmojis(text) {
  if (!text) return '';
  return text
    .normalize('NFKC')
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/[\uFE0F\u200D]/g, '')
    .replace(/[\u2600-\u27BF]/g, '')
    .replace(/[^\S\n]{2,}/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function isUsefulImageUrl(url) {
  if (!url || url.startsWith('blob:')) return false;
  if (/emoji\.php|static\.xx\.fbcdn|\/rsrc\.php|play_72dp|images\/video/i.test(url)) return false;
  if (/\/s\d{2,3}x\d{2,3}\/|\/p\d{2,3}x\d{2,3}\//i.test(url)) return false;
  if (/_q\.|_s\.jpg|_t\.jpg/i.test(url)) return false;
  if (/\/t15\.|\/t42\.|\/m1\/v\/|\/videos\/|\/v\/t6\/|\.mp4(\?|$)/i.test(url)) return false;
  if (/\/video/i.test(url) && !/\/photo/i.test(url)) return false;
  return /scontent|fbcdn|\.(jpe?g|png|webp)/i.test(url);
}

function imageDedupeKey(url) {
  try {
    const path = new URL(url).pathname;
    return path.split('/').pop() || path;
  } catch {
    return url;
  }
}

function uniqueImageUrls(urls) {
  const seen = new Set();
  return urls.filter((url) => {
    if (!isUsefulImageUrl(url)) return false;
    const key = imageDedupeKey(url);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function collectImageUrlsFromMarkdown(markdown) {
  const decoded = (markdown || '')
    .replace(/\\u0026/gi, '&')
    .replace(/\\\//g, '/');
  const urls = [];
  const imgRe = /!\[[^\]]*\]\((https?:[^)\s]+)\)/g;
  let match;
  while ((match = imgRe.exec(decoded))) {
    urls.push(match[1]);
  }
  const scontentRe = /https?:\/\/(?:scontent[^/\s"'<>\\]+)[^\s"'<>\\]*/g;
  let raw;
  while ((raw = scontentRe.exec(decoded))) {
    urls.push(raw[0].replace(/&amp;/g, '&'));
  }
  return uniqueImageUrls(urls);
}

function relatedImageSourceUrls(postUrl, markdown) {
  const urls = new Set();
  const pcb = markdown.match(/set=pcb\.(\d+)/);
  if (pcb?.[1]) {
    urls.add(`https://www.facebook.com/media/set/?set=pcb.${pcb[1]}`);
    const page = postUrl.match(/facebook\.com\/([^/?#]+)/i);
    if (page?.[1] && !['www', 'web', 'm', 'photo', 'watch', 'reel'].includes(page[1])) {
      urls.add(`https://www.facebook.com/${page[1]}/posts/${pcb[1]}`);
    } else {
      urls.add(`https://www.facebook.com/posts/${pcb[1]}`);
    }
  }
  const numeric = markdown.match(/\/posts\/(\d{10,})/);
  if (numeric?.[1] && !pcb) {
    const page = postUrl.match(/facebook\.com\/([^/?#]+)/i);
    if (page?.[1]) urls.add(`https://www.facebook.com/${page[1]}/posts/${numeric[1]}`);
  }
  return [...urls];
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return response.json();
}

const FACEBOOK_DATE_RE =
  /^(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:\s+at\s+[\d:]+(?:\s*[ap]m)?)?\s*·?\s*$/i;

function isTruncatedSnippet(text) {
  return /(?:…|\.\.\.)\s*$/.test((text || '').trim());
}

function isFacebookDateLine(line) {
  return FACEBOOK_DATE_RE.test((line || '').replace(/^·\s*/, '').trim());
}

function isMetaLine(line) {
  const lower = (line || '').replace(/^·\s*/, '').trim().toLowerCase();
  if (!lower) return true;
  if (isFacebookDateLine(lower)) return true;
  if (lower.startsWith('title:') || lower.startsWith('url source:') || lower.startsWith('markdown content')) return true;
  if (lower.includes("added to the album") || lower.includes("'s post")) return true;
  if (lower === 'log in' || lower.startsWith('forgot account') || lower.startsWith('forgot password')) return true;
  if (lower === 'like' || lower === 'comment' || lower === 'share' || lower === 'comments') return true;
  if (/^video\s*\d+$/i.test(lower)) return true;
  if (/^\d+:\d{2}\s*\/\s*\d+:\d{2}$/.test(lower)) return true;
  if (lower.includes('no comments yet') || lower.includes('see more on facebook')) return true;
  if (lower.includes('email or phone') || lower.includes('email or mobile') || lower === 'password') return true;
  if (lower.includes('create new account') || lower.includes('log into facebook')) return true;
  if (/facebook\.com\//i.test(lower) && lower.length > 24) return true;
  if (/^\d+\s*(share|shares)?$/.test(lower)) return true;
  return GENERIC_OG_TITLES.some((name) => lower === name || lower.startsWith(`${name}'s`));
}

function stripVideoAndEmbedUi(text) {
  return (text || '')
    .split(/All reactions:/i)[0]
    .split(/\[\[Video\s/i)[0]
    .split(/\nVideo\s+\d+\b/i)[0]
    .split(/\b0:\d{2}\s*\/\s*\d+:\d{2}/)[0]
    .split(/See more on Facebook/i)[0]
    .split(/Log into Facebook/i)[0]
    .split(/Comments(?:\n|$)/i)[0]
    .replace(/^\s*Video\s+\d+\s*$/gim, '');
}

function recoverPostBody(original, stripped) {
  const cleaned = (stripped || '').trim();
  if (cleaned.length > 80 && !/^video\s*\d+/i.test(cleaned) && !cleaned.toLowerCase().includes('log into facebook')) {
    return stripped;
  }
  const match =
    original.match(/(DỰ ÁN[\s\S]*?)(?:\nVideo\s+\d+|\n0:\d{2}|All reactions|See more on Facebook|\[\[Video)/i) ||
    original.match(/(Trong tháng[\s\S]*?)(?:\nVideo\s+\d+|All reactions|See more on Facebook|\[\[Video)/i);
  return match?.[1] || stripped;
}

function parseJinaMarkdown(markdown) {
  const imageUrls = collectImageUrlsFromMarkdown(markdown);

  let body = markdown.replace(/^[\s\S]*?(?:Markdown Content:\s*)/i, '');
  const originalBody = body;
  body = recoverPostBody(originalBody, stripVideoAndEmbedUi(body));
  body = body.replace(/!\[[^\]]*\]\([^)]+\)/g, ' ');
  body = body.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  body = body.replace(/^\s*[-*]{3,}\s*$/gm, '');

  const dateLineMatch = body.match(
    /((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:\s+at\s+[\d:]+(?:\s*[AP]M)?)?)/i
  );
  const dateLine = dateLineMatch?.[1] || '';

  const started = body.match(/(?:added to the album:[^\n]*\n+)([\s\S]+)$/i);
  if (started?.[1]) {
    body = started[1];
  }

  body = stripEmojis(body).replace(
    /^(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:\s+at\s+[\d:]+(?:\s*[ap]m)?)?\s*·\s*/i,
    ''
  );

  const lines = body
    .split('\n')
    .map((line) => line.replace(/^#+\s*/, '').replace(/\*+/g, '').replace(/^·\s*/, '').trim())
    .filter((line) => !isMetaLine(line) && line !== dateLine);

  const caption = lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();

  return { caption, imageUrls, dateLine };
}

function parseDateLine(dateLine) {
  if (!dateLine) return null;
  const cleaned = dateLine.replace(/\s+at\s+.*/i, '').replace(/·.*/, '').trim();
  const withYear = /\d{4}/.test(cleaned) ? cleaned : `${cleaned} ${new Date().getFullYear()}`;
  const parsed = Date.parse(withYear);
  return Number.isNaN(parsed) ? null : new Date(parsed);
}

async function fetchMicrolink(postUrl) {
  const data = await fetchJson(`https://api.microlink.io/?url=${encodeURIComponent(postUrl)}`);
  if (data.status !== 'success') throw new Error('Microlink could not read this post');
  const imageUrl = data.data?.image?.url;
  return {
    title: stripEmojis(data.data?.title || ''),
    description: stripEmojis(data.data?.description || ''),
    imageUrls: isUsefulImageUrl(imageUrl) ? [imageUrl] : [],
    date: data.data?.date ? new Date(data.data.date) : null,
  };
}

async function fetchJinaBody(targetUrl, format = 'markdown') {
  const headers = format === 'html' ? { 'X-Respond-With': 'html' } : {};
  const response = await fetch(`https://r.jina.ai/${encodeURIComponent(targetUrl)}`, { headers });
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return response.text();
}

async function fetchJinaMarkdown(postUrl) {
  return fetchJinaBody(postUrl, 'markdown');
}

async function fetchJina(postUrl) {
  const variants = [
    postUrl,
    postUrl.replace('://www.facebook.com', '://facebook.com'),
  ];
  let best = null;
  let bestMarkdown = '';
  for (const source of variants) {
    try {
      const [markdown, html] = await Promise.all([
        fetchJinaBody(source, 'markdown'),
        fetchJinaBody(source, 'html').catch(() => ''),
      ]);
      const parsed = parseJinaMarkdown(markdown);
      parsed.imageUrls = uniqueImageUrls([
        ...(parsed.imageUrls || []),
        ...collectImageUrlsFromMarkdown(html),
      ]);
      if (!parsed.caption && !parsed.imageUrls.length) continue;
      if (!best || parsed.caption.length > best.caption.length || parsed.imageUrls.length > (best.imageUrls?.length || 0)) {
        best = parsed;
        bestMarkdown = markdown;
      }
      if (!isTruncatedSnippet(parsed.caption) && parsed.caption.length > 120) {
        best = parsed;
        bestMarkdown = markdown;
        break;
      }
    } catch {
      // try next reader URL
    }
  }
  if (best) best.sourceMarkdown = bestMarkdown;
  return best;
}

function pickCaption(jinaCaption, microlinkDescription) {
  const jina = (jinaCaption || '').trim();
  const snippet = (microlinkDescription || '').trim();
  if (jina && !isTruncatedSnippet(jina) && jina.length >= 80) return jina;
  if (jina && snippet && jina.length > snippet.length + 20) return jina;
  if (snippet && !isTruncatedSnippet(snippet) && snippet.length > jina.length) return snippet;
  if (jina) return jina;
  return snippet;
}

function stripLeadingFacebookDate(text) {
  return (text || '').replace(
    /^(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:\s+at\s+[\d:]+(?:\s*[ap]m)?)?\s*·\s*/i,
    ''
  );
}

function titleFromCaption(caption, ogTitle) {
  const lines = stripLeadingFacebookDate(caption || '')
    .split(/\n+/)
    .map((line) => line.replace(/^·\s*/, '').trim())
    .filter((line) => line && !isMetaLine(line));

  let title = lines[0] || '';
  if (title.length > 90) {
    const sentence = title.split(/(?<=[.!?])\s+/)[0];
    title = sentence.length <= 90 ? sentence : title.slice(0, 90).trim();
  }

  const og = stripEmojis(ogTitle).toLowerCase();
  if (!title && ogTitle && !GENERIC_OG_TITLES.some((name) => og.includes(name))) {
    title = stripEmojis(ogTitle).slice(0, 90);
  }
  return title;
}

function isVietnamese(text) {
  return VIETNAMESE_RE.test(text);
}

async function translateChunks(text, langPair) {
  if (!text.trim()) return '';
  const chunks = [];
  let remaining = text;
  while (remaining.length) {
    if (remaining.length <= 400) {
      chunks.push(remaining);
      break;
    }
    let splitAt = remaining.lastIndexOf('\n', 400);
    if (splitAt < 80) splitAt = remaining.lastIndexOf(' ', 400);
    if (splitAt < 80) splitAt = 400;
    chunks.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt).trimStart();
  }

  const translated = [];
  for (const chunk of chunks) {
    const endpoint = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${langPair}`;
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error('Translation request failed');
    const data = await response.json();
    const next = data?.responseData?.translatedText;
    if (!next) throw new Error('Translation returned empty');
    translated.push(next);
  }
  return stripEmojis(translated.join('\n'));
}

function extensionFromType(type) {
  if (type.includes('png')) return 'png';
  if (type.includes('webp')) return 'webp';
  return 'jpg';
}

async function downloadViaMicrolink(sourceUrl, index) {
  const response = await fetch(
    `https://api.microlink.io/?url=${encodeURIComponent(sourceUrl)}&embed=image.url`
  );
  if (!response.ok) throw new Error(`Image ${index + 1} failed to download`);
  const type = response.headers.get('content-type') || '';
  if (!type.startsWith('image/')) throw new Error(`Image ${index + 1} was not an image`);
  const blob = await response.blob();
  if (!blob.size) throw new Error(`Image ${index + 1} was empty`);
  return new File([blob], `facebook-${index + 1}.${extensionFromType(type)}`, { type });
}

async function downloadViaWeserv(imageUrl, index) {
  const response = await fetch(`https://wsrv.nl/?url=${encodeURIComponent(imageUrl)}&n=-1`);
  if (!response.ok) throw new Error(`Image ${index + 1} failed to download`);
  const type = response.headers.get('content-type') || '';
  if (!type.startsWith('image/')) throw new Error(`Image ${index + 1} was not an image`);
  const blob = await response.blob();
  if (!blob.size) throw new Error(`Image ${index + 1} was empty`);
  return new File([blob], `facebook-${index + 1}.${extensionFromType(type)}`, { type });
}

async function downloadImages(postUrl, imageUrls) {
  const files = [];
  const seenKeys = new Set();

  const pushUnique = (file, sourceUrl) => {
    const key = `${file.size}:${imageDedupeKey(sourceUrl || file.name)}`;
    if (seenKeys.has(key) || file.size < 8000) return;
    seenKeys.add(key);
    files.push(file);
  };

  for (let i = 0; i < Math.min(imageUrls.length, 20); i += 1) {
    const sourceUrl = imageUrls[i];
    try {
      pushUnique(await downloadViaWeserv(sourceUrl, files.length), sourceUrl);
    } catch {
      try {
        pushUnique(await downloadViaMicrolink(sourceUrl, files.length), sourceUrl);
      } catch {
        // keep going
      }
    }
  }

  if (files.length === 0) {
    try {
      pushUnique(await downloadViaMicrolink(postUrl, 0), postUrl);
    } catch {
      // text-only import is still useful
    }
  }

  return files;
}

async function scrapePost(postUrl) {
  const jina = await fetchJina(postUrl).catch(() => null);
  const microlink = await fetchMicrolink(postUrl).catch(() => null);

  if (!microlink && !jina) {
    throw new Error(
      'Could not reach this Facebook post from the browser. GitHub Pages cannot scrape facebook.com directly. Try again, or use Manual Posting.'
    );
  }

  const caption = pickCaption(jina?.caption, microlink?.description);

  if (!caption) {
    throw new Error('Could not read post text. The post may be private. Use Manual Posting instead.');
  }

  const extraImageUrls = [];
  if (jina?.sourceMarkdown) {
    const extraSources = relatedImageSourceUrls(postUrl, jina.sourceMarkdown);
    const extraDocs = await Promise.all(
      extraSources.map((url) =>
        Promise.all([
          fetchJinaBody(url, 'markdown').catch(() => ''),
          fetchJinaBody(url, 'html').catch(() => ''),
        ]).then(([markdown, html]) => `${markdown}\n${html}`)
      )
    );
    extraDocs.forEach((markdown) => {
      extraImageUrls.push(...collectImageUrlsFromMarkdown(markdown));
    });
  }

  const imageUrls = uniqueImageUrls([
    ...(jina?.imageUrls || []),
    ...extraImageUrls,
    ...(microlink?.imageUrls || []),
  ]);

  return {
    caption,
    ogTitle: microlink?.title || '',
    imageUrls,
    date: parseDateLine(jina?.dateLine) || microlink?.date || new Date(),
    postUrl,
  };
}

export async function importFacebookPost(postUrl) {
  const trimmed = postUrl.trim();
  if (!isFacebookUrl(trimmed)) {
    throw new Error('Paste a Facebook post URL (facebook.com, fb.com, or fb.watch).');
  }

  const scraped = await scrapePost(trimmed);
  const title = titleFromCaption(scraped.caption, scraped.ogTitle);

  const files = await downloadImages(trimmed, scraped.imageUrls);

  const sourceIsVn = isVietnamese(scraped.caption) || isVietnamese(title);
  let titleEn = sourceIsVn ? '' : title;
  let titleVn = sourceIsVn ? title : '';
  let descriptionEn = sourceIsVn ? '' : scraped.caption;
  let descriptionVn = sourceIsVn ? scraped.caption : '';
  let translationFailed = false;

  try {
    if (sourceIsVn) {
      titleEn = await translateChunks(title, 'vi|en');
      descriptionEn = await translateChunks(scraped.caption, 'vi|en');
    } else {
      titleVn = await translateChunks(title, 'en|vi');
      descriptionVn = await translateChunks(scraped.caption, 'en|vi');
    }
  } catch {
    translationFailed = true;
  }

  let featuredFile = null;
  let galleryFiles = [];
  if (files.length === 1) {
    featuredFile = files[0];
  } else if (files.length > 1) {
    const featuredIndex = Math.floor(Math.random() * files.length);
    featuredFile = files[featuredIndex];
    galleryFiles = files.filter((_, index) => index !== featuredIndex);
  }

  return {
    titleEn,
    titleVn,
    descriptionEn,
    descriptionVn,
    date: scraped.date instanceof Date && !Number.isNaN(scraped.date.getTime()) ? scraped.date : new Date(),
    featuredFile,
    galleryFiles,
    imageCount: files.length,
    translationFailed,
    sourceLocale: sourceIsVn ? 'vn' : 'en',
  };
}
