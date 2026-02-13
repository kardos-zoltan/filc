import z from "zod";
import { hu } from "zod/v4/locales";

z.config(hu());

export default defineEventHandler(event => {});