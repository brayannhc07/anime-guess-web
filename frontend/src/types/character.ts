export interface AnimeCharacter {
  id: number;
  name: string;
  image: string;
  anime: string;
  gender?: "male" | "female" | "unknown";
  tags?: string[];
}

export interface CharacterTemplate {
  name: string;
  characters: AnimeCharacter[];
}
