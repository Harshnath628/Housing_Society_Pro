import { supabase } from './supabaseClient';

// --- mappers: DB snake_case rows <-> app camelCase objects -----------------

const toBuilding = (r) => ({ id: r.id, name: r.name, floors: r.floors, totalFlats: r.total_flats, yearBuilt: r.year_built });
const toFlat = (r) => ({ id: r.id, buildingId: r.building_id, flatNumber: r.flat_number, floor: r.floor, type: r.type, area: r.area, ownerName: r.owner_name, ownerMobile: r.owner_mobile });
const toResident = (r) => ({ id: r.id, flatId: r.flat_id, name: r.name, phone: r.phone, email: r.email, type: r.type, moveInDate: r.move_in_date });
const toBill = (r) => ({ id: r.id, flatId: r.flat_id, month: r.month, amount: r.amount, pendingDues: r.pending_dues, totalDue: r.total_due, status: r.status, generatedAt: r.generated_at });
const toPayment = (r) => ({ id: r.id, billId: r.bill_id, flatId: r.flat_id, amount: r.amount, mode: r.mode, reference: r.reference, date: r.date, receivedBy: r.received_by });
const toExpense = (r) => ({ id: r.id, category: r.category, description: r.description, amount: r.amount, date: r.date, paidTo: r.paid_to });
const toNotice = (r) => ({ id: r.id, title: r.title, content: r.content, priority: r.priority, date: r.date, author: r.author });

function unwrap({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}

// --- auth --------------------------------------------------------------

export async function signUpAdmin(email, password) {
  return unwrap(await supabase.auth.signUp({ email, password }));
}

export async function signInAdmin(email, password) {
  return unwrap(await supabase.auth.signInWithPassword({ email, password }));
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function getMyProfile() {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return null;
  const { data, error } = await supabase.from('profiles').select('id, society_id, email').maybeSingle();
  if (error) throw new Error(error.message);
  return data ? { id: data.id, societyId: data.society_id, email: data.email } : null;
}

export async function createSociety(name) {
  const { data, error } = await supabase.rpc('create_society', { p_society_name: name });
  if (error) throw new Error(error.message);
  return data;
}

// --- resident portal (no auth session, flat-number lookup only) --------

export async function getResidentPortal(flatNumber) {
  const { data, error } = await supabase.rpc('get_resident_portal', { p_flat_number: flatNumber });
  if (error) throw new Error(error.message);
  return data;
}

// --- bulk load (admin) --------------------------------------------------

export async function fetchAllData() {
  const [buildings, flats, residents, bills, payments, expenses, notices] = await Promise.all([
    supabase.from('buildings').select('*').order('id'),
    supabase.from('flats').select('*').order('id'),
    supabase.from('residents').select('*').order('id'),
    supabase.from('bills').select('*').order('id'),
    supabase.from('payments').select('*').order('id'),
    supabase.from('expenses').select('*').order('id'),
    supabase.from('notices').select('*').order('date', { ascending: false }),
  ]);
  return {
    buildings: unwrap(buildings).map(toBuilding),
    flats: unwrap(flats).map(toFlat),
    residents: unwrap(residents).map(toResident),
    bills: unwrap(bills).map(toBill),
    payments: unwrap(payments).map(toPayment),
    expenses: unwrap(expenses).map(toExpense),
    notices: unwrap(notices).map(toNotice),
  };
}

// --- buildings -----------------------------------------------------------

export async function createBuilding(societyId, b) {
  const row = unwrap(await supabase.from('buildings').insert({
    society_id: societyId, name: b.name, floors: b.floors, total_flats: b.totalFlats, year_built: b.yearBuilt,
  }).select().single());
  return toBuilding(row);
}

export async function updateBuilding(id, b) {
  const row = unwrap(await supabase.from('buildings').update({
    name: b.name, floors: b.floors, total_flats: b.totalFlats, year_built: b.yearBuilt,
  }).eq('id', id).select().single());
  return toBuilding(row);
}

export async function deleteBuilding(id) {
  const { error } = await supabase.from('buildings').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// --- flats -----------------------------------------------------------------

export async function createFlat(societyId, f) {
  const row = unwrap(await supabase.from('flats').insert({
    society_id: societyId, building_id: f.buildingId, flat_number: f.flatNumber, floor: f.floor,
    type: f.type, area: f.area, owner_name: f.ownerName || '', owner_mobile: f.ownerMobile || '',
  }).select().single());
  return toFlat(row);
}

export async function updateFlatOwner(id, ownerName, ownerMobile) {
  const row = unwrap(await supabase.from('flats').update({
    owner_name: ownerName, owner_mobile: ownerMobile,
  }).eq('id', id).select().single());
  return toFlat(row);
}

// --- residents ---------------------------------------------------------

export async function createResident(societyId, flatId, r) {
  const row = unwrap(await supabase.from('residents').insert({
    society_id: societyId, flat_id: flatId, name: r.name, phone: r.phone, email: r.email,
    type: r.type, move_in_date: r.moveInDate || null,
  }).select().single());
  return toResident(row);
}

export async function updateResident(id, r) {
  const row = unwrap(await supabase.from('residents').update({
    name: r.name, phone: r.phone, email: r.email, type: r.type, move_in_date: r.moveInDate || null,
  }).eq('id', id).select().single());
  return toResident(row);
}

// --- bills -----------------------------------------------------------------

export async function generateBills(societyId, bills) {
  const rows = unwrap(await supabase.from('bills').insert(bills.map(b => ({
    society_id: societyId, flat_id: b.flatId, month: b.month, amount: b.amount,
    pending_dues: b.pendingDues, total_due: b.totalDue, status: b.status, generated_at: b.generatedAt,
  }))).select());
  return rows.map(toBill);
}

export async function updateBillStatus(id, status) {
  const row = unwrap(await supabase.from('bills').update({ status }).eq('id', id).select().single());
  return toBill(row);
}

// --- payments ----------------------------------------------------------

export async function createPayment(societyId, p) {
  const row = unwrap(await supabase.from('payments').insert({
    society_id: societyId, bill_id: p.billId, flat_id: p.flatId, amount: p.amount,
    mode: p.mode, reference: p.reference, date: p.date, received_by: p.receivedBy || 'Admin',
  }).select().single());
  return toPayment(row);
}

// --- expenses ------------------------------------------------------------

export async function createExpense(societyId, e) {
  const row = unwrap(await supabase.from('expenses').insert({
    society_id: societyId, category: e.category, description: e.description,
    amount: e.amount, date: e.date, paid_to: e.paidTo || '',
  }).select().single());
  return toExpense(row);
}

// --- notices -------------------------------------------------------------

export async function createNotice(societyId, n) {
  const row = unwrap(await supabase.from('notices').insert({
    society_id: societyId, title: n.title, content: n.content, priority: n.priority,
  }).select().single());
  return toNotice(row);
}

export async function deleteNotice(id) {
  const { error } = await supabase.from('notices').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
