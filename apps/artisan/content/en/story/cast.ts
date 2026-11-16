import type { CastId, CastMember, Place, PlaceId } from "../../story/types";

/** The people who speak in story scenes. Each is fictional, and is the same person as in the cases. */
export const cast: Record<CastId, CastMember> = {
  joanna: { id: "joanna", name: "Joanna", role: "director" },
  sam: { id: "sam", name: "Sam", role: "front desk" },
  priya: { id: "priya", name: "Priya", role: "Homework Club coordinator" },
  dev: { id: "dev", name: "Dev", role: "newsletter volunteer" },
  nadia: { id: "nadia", name: "Nadia", role: "Commons board" },
  rafael: { id: "rafael", name: "Rafael", role: "Commons board" },
  leo: { id: "leo", name: "Leo", role: "Homework Club learner" },
  rosa: { id: "rosa", name: "Rosa", role: "editor, Riverside Gazette" },
  kwame: { id: "kwame", name: "Kwame", role: "independent auditor" },
  fatima: { id: "fatima", name: "Fatima", role: "town library" },
  hughes: { id: "hughes", name: "Councillor Hughes", role: "chair of the services committee" },
  okoro: { id: "okoro", name: "Councillor Okoro", role: "services committee" },
};

export const places: Record<PlaceId, Place> = {
  street: { id: "street", name: "Outside the Riverside Learning Commons" },
  frontDesk: { id: "frontDesk", name: "The front desk" },
  office: { id: "office", name: "The office" },
  homeworkRoom: { id: "homeworkRoom", name: "The Homework Club room" },
  boardRoom: { id: "boardRoom", name: "The board room" },
  studio: { id: "studio", name: "The studio" },
  gazette: { id: "gazette", name: "The Riverside Gazette newsroom" },
  townHall: { id: "townHall", name: "The town hall" },
};
