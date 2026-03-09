import type { CharacterTemplate } from "@/types/character";
import attackOnTitan from "./attack-on-titan.json";
import aveMujica from "./ave-mujica-the-die-is-cast.json";
import chainsawMan from "./chainsaw-man.json";
import dragonBall from "./dragon-ball.json";
import evangelion from "./evangelion.json";
import fate from "./fate.json";
import higurashi from "./higurashi-when-they-cry.json";
import jojo from "./jojo.json";
import jujutsuKaisen from "./jujutsu-kaisen.json";
import kOn from "./k-on.json";
import kaguya from "./kaguya.json";
import kaijuNo8 from "./kaiju-no-8.json";
import mix from "./mix.json";
import mushokuTensei from "./mushoku-tensei-jobless-reincarnation.json";
import nichijou from "./nichijou-my-ordinary-life.json";
import oshiNoKo from "./oshi-no-ko.json";
import pokemon from "./pok-mon-the-movie-i-choose-you.json";
import prisonSchool from "./prison-school.json";
import rascal from "./rascal.json";
import reZero from "./re-zero.json";
import quintuplets from "./the-quintessential-quintuplets.json";
import tuneIn from "./tune-in-to-the-midnight-heart.json";
import umamusume from "./umamusume.json";

const templates: Record<string, CharacterTemplate> = {
  "mix": mix as CharacterTemplate,
  "re-zero": reZero as CharacterTemplate,
  "jojo": jojo as CharacterTemplate,
  "dragon-ball": dragonBall as CharacterTemplate,
  "fate": fate as CharacterTemplate,
  "jujutsu-kaisen": jujutsuKaisen as CharacterTemplate,
  "umamusume": umamusume as CharacterTemplate,
  "pokemon": pokemon as CharacterTemplate,
  "mushoku-tensei": mushokuTensei as CharacterTemplate,
  "quintuplets": quintuplets as CharacterTemplate,
  "nichijou": nichijou as CharacterTemplate,
  "k-on": kOn as CharacterTemplate,
  "higurashi": higurashi as CharacterTemplate,
  "evangelion": evangelion as CharacterTemplate,
  "attack-on-titan": attackOnTitan as CharacterTemplate,
  "kaguya": kaguya as CharacterTemplate,
  "kaiju-no-8": kaijuNo8 as CharacterTemplate,
  "chainsaw-man": chainsawMan as CharacterTemplate,
  "oshi-no-ko": oshiNoKo as CharacterTemplate,
  "prison-school": prisonSchool as CharacterTemplate,
  "ave-mujica": aveMujica as CharacterTemplate,
  "tune-in": tuneIn as CharacterTemplate,
  "rascal": rascal as CharacterTemplate,
};

export default templates;
