import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getChartTheme } from '../theme/chartTheme';

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

export default function Reports({ bills, payments, expenses }) {
  const t = getChartTheme();
  const fmt = n => '₹' + n.toLocaleString('en-IN');

  const months = [...new Set([...bills.map(b => b.month), ...expenses.map(e => e.date.slice(0, 7))])].sort();

  const monthlyData = months.map(m => {
    const mBills = bills.filter(b => b.month === m);
    const expected = mBills.reduce((s, b) => s + b.amount, 0);
    const mPayments = payments.filter(p => {
      const bill = bills.find(b => b.id === p.billId);
      return bill?.month === m;
    });
    const collected = mPayments.reduce((s, p) => s + p.amount, 0);
    const mExpenses = expenses.filter(e => e.date.startsWith(m));
    const expenseTotal = mExpenses.reduce((s, e) => s + e.amount, 0);
    return { month: m, Expected: expected, Collected: collected, Expenses: expenseTotal, Net: collected - expenseTotal };
  });

  const totalExpected = monthlyData.reduce((s, d) => s + d.Expected, 0);
  const totalCollected = monthlyData.reduce((s, d) => s + d.Collected, 0);
  const totalExpenses = monthlyData.reduce((s, d) => s + d.Expenses, 0);

  return (
    <div>
      <div className="page-header"><h2>Reports</h2></div>

      <div className="kpi-grid">
        {[
          { label: 'Total Expected', value: fmt(totalExpected), cls: '' },
          { label: 'Total Collected', value: fmt(totalCollected), sub: `${((totalCollected / (totalExpected || 1)) * 100).toFixed(1)}%`, cls: 'success' },
          { label: 'Total Expenses', value: fmt(totalExpenses), cls: 'danger' },
          { label: 'Net Balance', value: fmt(totalCollected - totalExpenses), cls: 'warning' },
        ].map((kpi, i) => (
          <div className={`kpi-card ${kpi.cls} stagger-in`} key={i}>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value">{kpi.value}</div>
            {kpi.sub && <div className="kpi-sub">{kpi.sub}</div>}
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="card stagger-in" style={{ animationDelay: '200ms' }}>
          <div className="card-header"><h3>Monthly Collection vs Expected</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData} barGap={4}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: t.axisColor, fontSize: 12 }} />
                <YAxis tickFormatter={v => '₹' + (v / 1000) + 'k'} axisLine={false} tickLine={false} tick={{ fill: t.axisColor, fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(62,39,35,0.05)' }} />
                <Bar dataKey="Expected" fill={t.accentSoft} radius={[6,6,0,0]} />
                <Bar dataKey="Collected" fill={t.accent} radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card stagger-in" style={{ animationDelay: '250ms' }}>
          <div className="card-header"><h3>Net Balance Trend</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: t.axisColor, fontSize: 12 }} />
                <YAxis tickFormatter={v => '₹' + (v / 1000) + 'k'} axisLine={false} tickLine={false} tick={{ fill: t.axisColor, fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="Net" stroke={t.accent} strokeWidth={2} dot={{ r: 5, fill: t.accent, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="Expenses" stroke={t.rose} strokeWidth={2} dot={{ r: 5, fill: t.rose, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card stagger-in" style={{ animationDelay: '300ms' }}>
        <div className="card-header"><h3>Monthly Summary</h3></div>
        <div className="card-body table-wrap">
          <table>
            <thead><tr><th>Month</th><th>Expected</th><th>Collected</th><th>Collection %</th><th>Expenses</th><th>Net</th></tr></thead>
            <tbody>
              {monthlyData.map(d => (
                <tr key={d.month}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.month}</td>
                  <td>{fmt(d.Expected)}</td>
                  <td style={{ color: 'var(--emerald)' }}>{fmt(d.Collected)}</td>
                  <td>{d.Expected > 0 ? ((d.Collected / d.Expected) * 100).toFixed(0) + '%' : '—'}</td>
                  <td style={{ color: 'var(--rose)' }}>{fmt(d.Expenses)}</td>
                  <td style={{ fontWeight: 600, fontFamily: 'var(--font-display)', color: d.Net >= 0 ? 'var(--emerald)' : 'var(--rose)' }}>{fmt(d.Net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
