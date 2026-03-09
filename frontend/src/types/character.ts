export interface AnimeCharacter {
  id: number;
  name: string;
  image: string;
  anime: string;
}

export interface CharacterTemplate {
  name: string;
  characters: AnimeCharacter[];
}
