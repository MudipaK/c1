interface ILoginResponse {
  email: string;
  username: string;
  role: string;
  token: string;
}

interface IUser {
  _id: string;
  username: string;
  email: string;
  role: "staff admin" | "staff advisor" | "organizer";
}

interface ISignupResponse {
  email: string;
  username: string;
  role: string;
  token: string;
}

interface IGetUserDetailsResponse {
  email: string;
  username: string;
  role: string;
}

interface IErrorResponse {
  status: number;
  message: string;
  originalError: { message: string };
}
export interface IOrganization {
  _id: string;
  name: string;
  president: string | IUser;
  staffAdvisor: string | IUser;
  eventIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface ICrewMember {
  _id ?:string;
  name: string;
  email: string;
  phone: string;
}

interface ICrew {
  _id: string;
  description:string;
  name: string;
  phone: string;
  email: string;
  workType: string;
  leader: string;
  profilePic?: string;
  status: string; 
  crewMembers: ICrewMember[]; 
}

interface IEvent{
  eventID: string;
  eventName: string;
  eventDate: string;
  eventStartTime: string;
  eventFinishTime: string;
  timePeriod: string;
  eventPresident: string;
  eventProposal: string;
  eventForm: string; 
  eventMode: "Physical" | "Online";
  eventType: "Hackathon" | "Academic" | "Non-Academic";
  eventStatus: "Pending" | "Approved" | "Rejected";
}


export type {
  ICrew,
  ICrewMember,
  IOrganization,
  ILoginResponse,
  IGetUserDetailsResponse,
  IErrorResponse,
  ISignupResponse,
  IUser,
  IEvent,
};
