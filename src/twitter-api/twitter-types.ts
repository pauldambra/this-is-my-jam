export interface TootHTML {
  html: string;
  width: number;
  cache_age: number;
}

export interface TwitterTokenResponse {
  token_type: 'bearer';
  access_token: string;
}

export interface Tooter {
  screen_name: string;
}

// full schema at https://developer.twitter.com/en/docs/tweets/data-dictionary/overview/intro-to-tweet-json
export interface Toot {
  id_str: string;
  user: Tooter;
  'created_at': string;
  'text': string;
  'truncated': boolean;
}

export interface TwitterSearchResults {
  statuses: Array<Toot>;
  search_metadata: object;
}
