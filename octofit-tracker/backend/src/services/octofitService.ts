import { Activity, Team, User, Workout } from '../models/index.js';
import mongoose from 'mongoose';

function httpError(message: string, status: number) {
  return Object.assign(new Error(message), { status });
}

function inputRecord(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw httpError('Request body must be an object', 400);
  }
  return input as Record<string, unknown>;
}

function validObjectId(value: unknown) {
  return typeof value === 'string' && mongoose.isValidObjectId(value);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const body = inputRecord(input);
  const { userId, teamId, type, minutes } = body;
  if (!validObjectId(userId) || !validObjectId(teamId)) {
    throw httpError('A valid userId and teamId are required', 400);
  }
  if (typeof type !== 'string' || !type.trim() || typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes < 1) {
    throw httpError('A type and positive numeric minutes value are required', 400);
  }
  const [user, team] = await Promise.all([
    User.findById(userId),
    Team.findById(teamId),
  ]);
  if (!user || !team) {
    throw httpError('The referenced user or team does not exist', 404);
  }
  const activity = await Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const body = inputRecord(input);
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const mascot = typeof body.mascot === 'string' ? body.mascot.trim() : '';
  if (!name) {
    throw httpError('Team name is required', 400);
  }
  if (!mascot) {
    throw httpError('Team mascot is required', 400);
  }
  const members = Array.isArray(body.members)
    ? body.members.filter(validObjectId)
    : [];
  const team = await Team.create({ name, mascot, members });
  return team.toObject();
}

export async function getLeaderboard() {
  const teams = await Team.find().lean();
  const totals = await Activity.aggregate([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
  ]);
  const totalByTeam = new Map(totals.map((entry) => [entry._id.toString(), entry.totalPoints]));
  return teams
    .map((team) => ({
      teamName: team.name,
      totalPoints: totalByTeam.get(team._id.toString()) ?? 0,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints || a.teamName.localeCompare(b.teamName))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() }).lean();
  if (!user) {
    throw httpError('User not found', 404);
  }
  const recent = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const goal = typeof user.fitnessGoal === 'string' ? user.fitnessGoal.toLowerCase() : '';
  const focus = recent?.type?.toLowerCase() === 'run'
    ? 'endurance'
    : recent?.type?.toLowerCase() === 'strength'
      ? 'strength'
      : goal || (recent?.type?.toLowerCase() ?? 'mobility');
  const suggestions = await Workout.find({
    $or: [{ focus: { $regex: `^${focus}$`, $options: 'i' } }, { focus: { $in: [goal].filter(Boolean) } }],
  }).lean();
  if (suggestions.length === 0) {
    return Workout.find().lean();
  }
  const reason = recent?.type
    ? `Based on recent ${recent.type} activity and your ${focus} goal`
    : `Based on your ${focus} goal`;
  return suggestions.map((workout) => ({ ...workout, reason }));
}

export { User };
