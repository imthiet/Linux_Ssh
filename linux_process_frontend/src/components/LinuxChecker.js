import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function LinuxChecker() {
  const [formData, setFormData] = useState({ username: '', password: '', ip: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processRows, setProcessRows] = useState([]);

  const [configLoading, setConfigLoading] = useState(false);
  const [configError, setConfigError] = useState('');
  const [systemConfig, setSystemConfig] = useState('');

  const [userFilter, setUserFilter] = useState('All');
  const [cpuSortOrder, setCpuSortOrder] = useState('none');
  const [memSortOrder, setMemSortOrder] = useState('none');
  const [commandFilter, setCommandFilter] = useState('');

  const [autoRefresh, setAutoRefresh] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchProcesses = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:8080/api/check-process', formData);
      const data = response.data;

      if (data.success) {
        const lines = data.output.trim().split('\n');
        const parsed = lines.slice(1).map(line => {
          const parts = line.trim().split(/\s+/, 10);
          const command = line.substring(line.indexOf(parts[9]) + parts[9].length).trim();
          return [...parts, command];
        });
        setProcessRows(parsed);
      } else {
        setError(`⚠️ Server error: ${data.error}`);
      }
    } catch (err) {
      setError(`❌ Error: ${err.response?.data || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemConfig = async () => {
    setConfigLoading(true);
    setConfigError('');
    try {
      const response = await axios.post('http://localhost:8080/api/check-config', formData);
      const data = response.data;

      if (data.success) {
        setSystemConfig(data.output);
      } else {
        setConfigError(`⚠️ Server error: ${data.error}`);
        setSystemConfig('');
      }
    } catch (err) {
      setConfigError(`❌ Error: ${err.response?.data || err.message}`);
      setSystemConfig('');
    } finally {
      setConfigLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetchProcesses();
    await fetchSystemConfig();
  };

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchProcesses();
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, formData]);

  const uniqueUsers = useMemo(() => ['All', ...Array.from(new Set(processRows.map(row => row[0])))], [processRows]);

  const filteredAndSortedRows = useMemo(() => {
    let rows = [...processRows];

    if (userFilter !== 'All') {
      rows = rows.filter(row => row[0] === userFilter);
    }

    if (commandFilter.trim() !== '') {
      const keyword = commandFilter.toLowerCase();
      rows = rows.filter(row => row[10]?.toLowerCase().includes(keyword));
    }

    if (cpuSortOrder !== 'none') {
      rows.sort((a, b) => cpuSortOrder === 'asc'
        ? parseFloat(a[2]) - parseFloat(b[2])
        : parseFloat(b[2]) - parseFloat(a[2])
      );
    }

    if (memSortOrder !== 'none') {
      rows.sort((a, b) => memSortOrder === 'asc'
        ? parseFloat(a[3]) - parseFloat(b[3])
        : parseFloat(b[3]) - parseFloat(a[3])
      );
    }

    return rows;
  }, [processRows, userFilter, cpuSortOrder, memSortOrder, commandFilter]);

  const exportCSV = () => {
    const headers = ['USER', 'PID', '%CPU', '%MEM', 'VSZ', 'RSS', 'TTY', 'STAT', 'START', 'TIME', 'COMMAND'];
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedRows.map(row => row.map(col => `"${col}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'processes.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container" style={{ maxWidth: 1000, padding: 20, fontFamily: 'Arial' }}>
      <h2 className="mb-4">🖥️ Linux Process Checker</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
        <input
          name="username"
          placeholder="Username (e.g. root)"
          value={formData.username}
          onChange={handleChange}
          required
          className="form-control"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="form-control"
        />
        <input
          name="ip"
          placeholder="Server IP (e.g. 192.168.1.100)"
          value={formData.ip}
          onChange={handleChange}
          required
          className="form-control"
        />
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? '🔄 Checking...' : 'Check Processes'}
        </button>
      </form>

      {error && <div className="text-danger mt-3">{error}</div>}

      {filteredAndSortedRows.length > 0 && (
        <>
          <div className="d-flex flex-wrap gap-3 mt-4 justify-content-center align-items-center">
            <label>
              Filter by User:
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="form-select ms-2"
              >
                {uniqueUsers.map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Sort by %CPU:
              <select
                value={cpuSortOrder}
                onChange={(e) => setCpuSortOrder(e.target.value)}
                className="form-select ms-2"
              >
                <option value="none">None</option>
                <option value="asc">Low → High</option>
                <option value="desc">High → Low</option>
              </select>
            </label>

            <label>
              Sort by %MEM:
              <select
                value={memSortOrder}
                onChange={(e) => setMemSortOrder(e.target.value)}
                className="form-select ms-2"
              >
                <option value="none">None</option>
                <option value="asc">Low → High</option>
                <option value="desc">High → Low</option>
              </select>
            </label>

            <label>
              Search COMMAND:
              <input
                type="text"
                value={commandFilter}
                onChange={(e) => setCommandFilter(e.target.value)}
                placeholder="e.g. java"
                className="form-control ms-2"
                style={{ display: 'inline-block', width: '200px' }}
              />
            </label>

            <button onClick={exportCSV} className="btn btn-success px-3">
              📤 Export CSV
            </button>

            <label className="form-check-label d-flex align-items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={() => setAutoRefresh(!autoRefresh)}
                className="form-check-input me-2"
              />
              Auto Refresh (10s)
            </label>
          </div>

          <div
            style={{
              overflowY: 'auto',
              overflowX: 'auto',
              marginTop: 20,
              maxWidth: 1000,
              height: 400,
              marginLeft: 'auto',
              marginRight: 'auto',
              border: '1px solid #ccc',
              borderRadius: 5,
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            }}
          >
            <table
              className="table table-bordered table-hover mb-0"
              style={{
                minWidth: 900,
                fontSize: 14,
              }}
            >
              <thead className="table-light sticky-top">
                <tr>
                  <th>USER</th>
                  <th>PID</th>
                  <th>%CPU</th>
                  <th>%MEM</th>
                  <th>VSZ</th>
                  <th>RSS</th>
                  <th>TTY</th>
                  <th>STAT</th>
                  <th>START</th>
                  <th>TIME</th>
                  <th>COMMAND</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedRows.map((row, idx) => (
                  <tr key={idx}>
                    {row.map((col, i) => (
                      <td key={i}>{col}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="mt-5">
        <h3>🛠️ System Configuration</h3>
        {configError && <div className="text-danger">{configError}</div>}
        {systemConfig && (
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              backgroundColor: '#f7f7f7',
              padding: 15,
              borderRadius: 5,
              maxHeight: 400,
              overflowY: 'auto',
              fontSize: 14,
            }}
          >
            {systemConfig}
          </pre>
        )}
      </div>
    </div>
  );
}

export default LinuxChecker;
