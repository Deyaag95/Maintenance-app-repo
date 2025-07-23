import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MaintenanceDashboard() {
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({
    assetId: "",
    action: "",
    performedBy: "",
    date: "",
    cost: "",
    notes: "",
  });

  const API_URL = import.meta.env.VITE_API_URL || "/api";

  useEffect(() => {
    fetch(`${API_URL}/logs`).then(res => res.json()).then(setLogs);
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const newLog = await res.json();
    setLogs([newLog, ...logs]);
    setForm({ assetId: "", action: "", performedBy: "", date: "", cost: "", notes: "" });
  };

  const handleDelete = async id => {
    await fetch(`${API_URL}/logs/${id}`, { method: "DELETE" });
    setLogs(logs.filter(log => log.id !== id));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🛠 Maintenance Tracker</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mb-8">
        <Input placeholder="Asset ID" value={form.assetId} onChange={e => setForm({ ...form, assetId: e.target.value })} required />
        <Input placeholder="Action Taken" value={form.action} onChange={e => setForm({ ...form, action: e.target.value })} required />
        <Input placeholder="Performed By" value={form.performedBy} onChange={e => setForm({ ...form, performedBy: e.target.value })} required />
        <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
        <Input placeholder="Cost" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} />
        <Input placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        <div className="col-span-2">
          <Button type="submit" className="w-full">Add Maintenance Log</Button>
        </div>
      </form>

      <div className="space-y-4">
        {logs.map(log => (
          <Card key={log.id} className="shadow-md">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p><strong>{log.asset_id}</strong> – {log.action}</p>
                  <p className="text-sm text-gray-500">By {log.performed_by} on {log.date}</p>
                  {log.cost && <p className="text-sm">Cost: {log.cost}</p>}
                  {log.notes && <p className="text-sm">Notes: {log.notes}</p>}
                </div>
                <Button variant="destructive" onClick={() => handleDelete(log.id)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
