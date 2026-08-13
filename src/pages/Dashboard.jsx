import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { COLORS, getChartTheme } from '../theme/chartTheme';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const t = getChartTheme();
  return (
    <div style={{ background: t.tooltipBg, border: `1px solid ${t.tooltipBorder}`, borderRadius: 10, padding: '12px 16px', boxShadow: '0 8px 24px rgba(62,39,35,0.15)' }}>
      <p style={{ color: t.textPrimary, fontWeight: 600, marginBottom: 6, fontSize: 13 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: 12, margin: '2px 0' }}>
          {p.name}: ₹{p.value.toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard({ buildings, flats, bills, payments, expenses }) {
  const t = getChartTheme();
  const totalExpected = bills.reduce((s, b) => s + b.amount, 0);
  const totalCollected = payments.reduce((s, p) => s + p.amount, 0);
  const totalPending = bills.filter(b => b.status !== 'Paid').reduce((s, b) => {
    const paid = payments.filter(p => p.billId === b.id).reduce((ps, p) => ps + p.amount, 0);
    return s + (b.totalDue - paid);
  }, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  const buildingWise = buildings.map(b => {
    const bFlats = flats.filter(f => f.buildingId === b.id);
    const flatIds = bFlats.map(f => f.id);
    const collected = payments.filter(p => flatIds.includes(p.flatId)).reduce((s, p) => s + p.amount, 0);
    const expected = bills.filter(bl => flatIds.includes(bl.flatId)).reduce((s, bl) => s + bl.amount, 0);
    return { name: b.name, Collected: collected, Expected: expected };
  });

  const expenseByCategory = {};
  expenses.forEach(e => { expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amount; });
  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

  const topDefaulters = flats.map(f => {
    const flatBills = bills.filter(b => b.flatId === f.id);
    const flatPayments = payments.filter(p => p.flatId === f.id);
    const totalBilled = flatBills.reduce((s, b) => s + b.totalDue, 0);
    const totalPaid = flatPayments.reduce((s, p) => s + p.amount, 0);
    return { flat: f.flatNumber, owner: f.ownerName || '—', outstanding: totalBilled - totalPaid };
  }).filter(d => d.outstanding > 0).sort((a, b) => b.outstanding - a.outstanding).slice(0, 5);

  const fmt = n => '₹' + n.toLocaleString('en-IN');

  return (
    <div>
      <div className="page-header"><h2>Dashboard</h2></div>

      <div className="kpi-grid">
        {[
          { label: 'Total Buildings', value: buildings.length, sub: `${flats.length} flats registered`, cls: '' },
          { label: 'Total Collected', value: fmt(totalCollected), sub: `${((totalCollected / (totalExpected || 1)) * 100).toFixed(0)}% collection rate`, cls: 'success' },
          { label: 'Pending Amount', value: fmt(totalPending), sub: `from ${bills.filter(b => b.status !== 'Paid').length} unpaid bills`, cls: 'warning' },
          { label: 'Total Expenses', value: fmt(totalExpenses), sub: `Net: ${fmt(totalCollected - totalExpenses)}`, cls: 'danger' },
        ].map((kpi, i) => (
          <div className={`kpi-card ${kpi.cls} stagger-in`} key={i}>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-sub">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="card stagger-in" style={{ animationDelay: '200ms' }}>
          <div className="card-header"><h3>Building-wise Collection</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={buildingWise} barGap={4}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: t.axisColor, fontSize: 12 }} />
                <YAxis tickFormatter={v => '₹' + (v / 1000) + 'k'} axisLine={false} tickLine={false} tick={{ fill: t.axisColor, fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(62,39,35,0.05)' }} />
                <Bar dataKey="Expected" fill={t.accentSoft} radius={[6,6,0,0]} />
                <Bar dataKey="Collected" fill={t.accent} radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card stagger-in" style={{ animationDelay: '250ms' }}>
          <div className="card-header"><h3>Expense Breakdown</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} innerRadius={50} dataKey="value" strokeWidth={0}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card stagger-in" style={{ animationDelay: '300ms' }}>
        <div className="card-header"><h3>Top Defaulters</h3></div>
        <div className="card-body table-wrap">
          <table>
            <thead><tr><th>#</th><th>Flat</th><th>Owner</th><th>Outstanding</th></tr></thead>
            <tbody>
              {topDefaulters.map((d, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td><span className="font-mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.flat}</span></td>
                  <td>{d.owner}</td>
                  <td><span style={{ color: 'var(--rose)', fontWeight: 600, fontFamily: 'var(--font-display)' }}>{fmt(d.outstanding)}</span></td>
                </tr>
              ))}
              {topDefaulters.length === 0 && <tr><td colSpan={4} className="text-center" style={{ padding: 28, color: 'var(--text-muted)' }}>No defaulters</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
