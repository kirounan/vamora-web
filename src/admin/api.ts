import { API_BASE_URL } from '../config';

export class AdminApiError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}
let csrfToken = '';
export const apiOrigin = (import.meta.env.VITE_ADMIN_API_BASE_URL || API_BASE_URL).replace(/\/$/, '');
const base = apiOrigin + '/api/v1/admin';
export async function adminApi<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(base + path, {
    method, credentials: 'include', headers: {
      Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(method === 'GET' ? {} : { 'X-Admin-CSRF': csrfToken }),
    }, ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/login') window.dispatchEvent(new Event('admin-session-expired'));
    throw new AdminApiError(response.status, Array.isArray(result?.message) ? result.message.join(' ') : result?.message || 'The change could not be saved. Please try again.');
  }
  if (result?.csrfToken) csrfToken = result.csrfToken;
  return result as T;
}
export async function adminUpload(path: string, body: FormData) {
  const response = await fetch(base + path, { method: 'POST', credentials: 'include', headers: { Accept: 'application/json', 'X-Admin-CSRF': csrfToken }, body });
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) window.dispatchEvent(new Event('admin-session-expired'));
    throw new AdminApiError(response.status, Array.isArray(result?.message) ? result.message.join(' ') : result?.message || 'The photo could not be saved.');
  }
  return result;
}
export const changeRequest = (reason: string, requestId?: string) => ({ reason, requestId: requestId || crypto.randomUUID() });
export const message = (error: unknown) => error instanceof Error ? error.message : 'Something went wrong. Please try again.';

export interface Person { id: string; name: string | null; nickname: string | null; imageUrl?: string | null; position?: string | null }
export interface Participant { id: string; userId: string; user: Person; participationType: string; state: string; isVirtual: boolean; goals: number; assists: number; matchesPlayed: number; fantasyPoints: number; fantasyManagerPoints: number }
export interface Team { id: string; name: string; captainId: string | null; approvalStatus: string; groupId: string | null; members: { userId: string; isStarter: boolean; user: Person }[] }
export interface MatchEvent { id: string; playerId: string; eventType: string; minute: number; addedTime: number | null; teamType: string; assistPlayerId: string | null; substitutePlayerId: string | null; savedByPlayerId: string | null; isShootout: boolean; description?: string | null }
export interface Match { id: string; homeTeamId: string | null; awayTeamId: string | null; homeTeamNickname: string | null; awayTeamNickname: string | null; homePlayers: string[]; awayPlayers: string[]; homeGoalkeeperId: string | null; awayGoalkeeperId: string | null; homeScore: number | null; awayScore: number | null; homePenaltyScore: number | null; awayPenaltyScore: number | null; status: string; duration: number | null; scheduledTime: string | null; actualStartTime: string | null; actualEndTime: string | null; venue: string | null; updatedAt: string; matchAdminId: string | null; roundId: string | null; groupId: string | null; winnerTeamId: string | null; resolutionType: string; replayOfMatchId: string | null; events: MatchEvent[] }
export interface Round { id: string; name: string; roundNumber: number; status: string; type: string; fantasySquads: { id: string; points: number }[] }
export interface Competition {
  id: string; name: string; uniqueCode: string; type: string; status: string; updatedAt: string;
  location: string; additionalLocations: string[]; countryId: string; cityId: string | null;
  startTime: string; duration: number; maxTeams: number; maxPlayersPerTeam: number; playersInMatch: number;
  hasFantasy: boolean; description: string | null; currency: string; fees: number;
  firstPrize: string | null; secondPrize: string | null; thirdPrize: string | null;
  creatorId: string; creator: Person; admins: { userId: string; user: Person }[];
  players: Participant[]; teams: Team[]; matches: Match[]; rounds: Round[];
  groups: { id: string; name: string; standings: { teamId: string; played: number; points: number; goalDifference: number }[] }[];
  tournamentSlots: { id: string; roundId: string; bracketRound: number; slotNumber: number; homeTeamId: string | null; awayTeamId: string | null; winnerTeamId: string | null; isThirdPlace: boolean; status: string }[];
  groupKnockoutSettings: { numberOfGroups: number; qualifiersPerGroup: number; bestPlacedCount: number; defaultMatchDuration: number | null; thirdPlaceMatch: boolean; assignmentMode: string; knockoutSeedingMode: string } | null;
  resultPhotos: { slot: string; imageUrl: string | null; subjectId: string | null; version: number }[];
  captainRequests: { id: string; status: string; teamId: string | null; applicant: Person }[];
}
export interface VirtualPlayer { userId: string; archivedAt: string | null; createdAt: string; user: Person & { _count: { playerParticipations: number } } }
export const personName = (person?: Person) => person?.name || person?.nickname || 'Unnamed player';
export const formatName = (type: string) => ({ GAMEDAY: 'Gameday', GROUP_KNOCKOUT: 'Hybrid', LEAGUE: 'League', TOURNAMENT: 'Cup' })[type] || type;
export const readable = (value: string) => value.toLowerCase().replaceAll('_', ' ').replace(/^\w/, (s) => s.toUpperCase());
export const dateTime = (value: string | null) => value ? new Date(value).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : 'Not scheduled';
export function matchSideName(competition: Competition, match: Match, side: 'home' | 'away') {
  return competition.teams.find((t) => t.id === (side === 'home' ? match.homeTeamId : match.awayTeamId))?.name
    || (side === 'home' ? match.homeTeamNickname : match.awayTeamNickname) || (side === 'home' ? 'Home' : 'Away');
}
