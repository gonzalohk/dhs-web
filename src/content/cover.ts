// Home page cover: the photo is the background of the first section (it fills the section and adapts to
// its size) with a navy layer on top; the company name (eyebrow, title, subtitle) and the actions sit over
// it at every screen size. Set `cover` to `null` to show the text-only hero instead.
import type { StaticImageData } from "next/image";
import portada from "@/assets/brand/portada.jpg";

export const cover: StaticImageData | null = portada;

export const COVER_ALT = "DHS, Distribuidora Hernández Sanjinés: repartidor con tableta y paquete";
