
import React, { useEffect, useState } from 'react'
import './Contact.css'

const Contact = () => {
  const [contactData, setContactData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('https://api.fitnessguru.org.in/contact_api.php')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok')
        return res.json()
      })
      .then((data) => {
        setContactData(data)
        setLoading(false)
      })
      .catch((err) => {
        setError('Failed to load contact info')
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="contact-section"><div className="container">Loading...</div></div>
  if (error) return <div className="contact-section"><div className="container">{error}</div></div>

  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Contact Us</h2>
          <p className="section-subtitle">Get in touch with us today</p>
        </div>
        <div className="contact-content">
          <div className="contact-info">
            <div className="info-card">
              <div className="info-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div className="info-details">
                <h3>Address</h3>
                <p>
                  {contactData.address && contactData.address.name}<br />
                  {contactData.address && contactData.address.city}, {contactData.address && contactData.address.state}<br />
                  {contactData.address && contactData.address.country}
                </p>
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon">
                <i className="fas fa-phone"></i>
              </div>
              <div className="info-details">
                <h3>Phone</h3>
                <p>
                  {contactData.phone && contactData.phone.map((p, i) => (
                    <span key={i}>{p}<br /></span>
                  ))}
                </p>
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon">
                <i className="fas fa-envelope"></i>
              </div>
              <div className="info-details">
                <h3>Email</h3>
                <p>
                  {contactData.email && contactData.email.map((e, i) => (
                    <span key={i}>{e}<br /></span>
                  ))}
                </p>
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="info-details">
                <h3>Hours</h3>
                <p>
                  {contactData.hours && Object.entries(contactData.hours).map(([day, time], i) => (
                    <span key={i}>{day}: {time}<br /></span>
                  ))}
                </p>
              </div>
            </div>
          </div>
          <div className="contact-form-container">
            <div className="contact-form">
              <h3>Send us a Message</h3>
              <form>
                <div className="form-group">
                  <input type="text" placeholder="Your Name" required />
                </div>
                <div className="form-group">
                  <input type="email" placeholder="Your Email" required />
                </div>
                <div className="form-group">
                  <input type="tel" placeholder="Your Phone" />
                </div>
                <div className="form-group">
                  <select>
                    <option value="">Select Service</option>
                    <option value="membership">Membership Inquiry</option>
                    <option value="personal-training">Personal Training</option>
                    <option value="group-classes">Group Classes</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <textarea rows="5" placeholder="Your Message" required></textarea>
                </div>
                <button type="submit" className="submit-btn">Send Message</button>
              </form>
            </div>
          </div>
        </div>
        <div className="map-section">
          <h3>Find Us Here</h3>
          <div className="map-container">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3744.300110257676!2d85.79746567582602!3d20.204846415565353!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a19a6668a95f523%3A0x4fea5bf5951e5dd!2sFitness%20Guru%20Gym!5e0!3m2!1sen!2sin!4v1769542747434!5m2!1sen!2sin"
              width="100%" 
              height="400" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Fitness Guru Gym Location"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact