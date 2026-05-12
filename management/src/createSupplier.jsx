import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';

/*
  CreateSupplier
  - Controlled form for creating a supplier.
  - Minimal validation: `name` and `email` are required.
  - Calls `onCreate` with created supplier object on success (if provided).
  - Displays simple status and error messages.
*/

export default function CreateSupplier({ apiEndpoint = '/api/createsupplier', onCreate }) {
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
    const [dataFormat, setdataFormat] = useState("");

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',

  });



    useEffect(() => {
        const fetchL = () => {
            

            


            console.log(dataFormat);
        }


        fetchL();
    }

        , [dataFormat]);




  function validate(current) {
    const e = {};
    if (!current.name.trim()) e.name = 'Supplier name is required.';
    if (!current.email.trim()) {
      e.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(current.email)) {
      e.email = 'Email is invalid.';
    }
    if (current.phone && !/^[0-9+\-\s()]{6,}$/.test(current.phone)) {
      e.phone = 'Phone number looks invalid.';
    }
    return e; 
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error while typing
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setStatusMessage('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validation = validate(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      setStatusMessage('Please fix validation errors.');
      return;
    }

    setSubmitting(true);
    setStatusMessage('Creating supplier...');
     

      let sup = { ...form, data_format: dataFormat }


      console.log(sup);


    try {
        const res = await fetch("http://localhost:5000"+apiEndpoint, {
        method: 'POST',
          headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ supplier: sup}),

      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        const message = payload && payload.message ? payload.message : `Server returned ${res.status}`;
        throw new Error(message);
        }



       

      const created = await res.json().catch(() => null);
      setStatusMessage('Supplier created successfully.');
      setForm({ name: '', email: '', phone: '', address: '', notes: '' });
      setErrors({});
      if (typeof onCreate === 'function') onCreate(created);
    } catch (err) {
      setStatusMessage(`Failed to create supplier: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

    return (

        <div style={{ width: "100%", margin:"50px 0px 0px 30px ", display: "flex", justifyContent: "center", backgroundColor:"#0c086b",padding:"20px",color:"white"}} >


            <form style={{ width: "100%", display: "flex", justifyContent: "left",margin:"0px 0px 0px 0px" }}  onSubmit={handleSubmit} aria-label="create-supplier-form" noValidate>
      <div>
        <label htmlFor="name">Name *</label>
              <input
                  className="form-control"
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          disabled={submitting}
        />
        {errors.name && <div role="alert" style={{ color: 'red' }}>{errors.name}</div>}
      </div>
                <br />
      <div>
        <label htmlFor="email">Email *</label>
                    <input
                        style={{ height: "40px", margin: "0px 10px 0px 0px" }}

                  className="form-control"
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          disabled={submitting}
        />
        {errors.email && <div role="alert" style={{ color: 'red' }}>{errors.email}</div>}
      </div>

      <div>
        <label htmlFor="phone">Phone</label>
              <input
                  className="form-control"
          id="phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          disabled={submitting}
        />
        {errors.phone && <div role="alert" style={{ color: 'red' }}>{errors.phone}</div>}
      </div>

      <div>
        <label htmlFor="address">Address</label>
              <input
                  className="form-control"
          id="address"
          name="address"
          type="text"
          value={form.address}
          onChange={handleChange}
          disabled={submitting}
        />
      </div>

                <div class="input-group mb-3" style={{ height:"40px",margin:"23px 0px 0px 0px" }} >
                    <label class="input-group-text" for="inputGroupSelect01">Data Format</label>
                    <select class="form-select" id="inputGroupSelect01" onChange={(e) => setdataFormat(e.target.value)}>
                        <option selected>Choose...</option>
                        <option value="Manual">Manual</option>
                        <option value="CSV">CSV</option>
                        <option value="XML">XML</option>
                        <option value="Live Feed">Live Feed</option>
                    </select>
                </div>

                <div>
                    <button style={{ margin: "20px 0px 0px 15px", backgroundColor: "grey" }} type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Supplier'}
        </button>
      </div>
       
          {statusMessage && <div role="status" style={{ marginTop: 8 }}>{statusMessage}</div>}
    </form>
        </div>
  );
};

CreateSupplier.propTypes = {
  apiEndpoint: PropTypes.string,
  onCreate: PropTypes.func,
};

          