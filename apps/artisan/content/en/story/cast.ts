import type { CastId, CastMember, Place, PlaceId } from "../../story/types";

/** The people who speak in story scenes. Each is fictional, and matches the same person in the cases. */
export const cast: Record<CastId, CastMember> = {
  joanna: { id: "joanna", name: "Joanna", role: "director" },
  sam: { id: "sam", name: "Sam", role: "front desk" },
  priya: { id: "priya", name: "Priya", role: "Homework Club coordinator" },
};

export const places: Record<PlaceId, Place> = {
  street: { id: "street", name: "Outside the Riverside Learning Commons" },
  frontDesk: { id: "frontDesk", name: "The front desk" },
  office: { id: "office", name: "The office" },
  homeworkRoom: { id: "homeworkRoom", name: "The Homework Club room" },
};
