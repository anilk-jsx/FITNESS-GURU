import React, { useState } from 'react'
import './Contact.css'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success', 'error', or null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const response = await fetch('https://test-api.fitnessguru.org.in/api/addContactUs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          name: '',
          email: '',
          phone: '',
          service: '',
          message: ''
        })
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Contact Us</h2>
          <p className="section-subtitle">Get in touch with us today</p>
        </div>
        <div className="contact-content">
          <div className="contact-info">
            <div className="info-card-contact">
              <div className="info-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div className="info-details">
                <h3>Address</h3>
                <p>
                  Fitness Guru Gym<br />
                  Sundarpada, Bhubaneswar, Odisha, India<br />
                </p>
              </div>
            </div>
            <div className="info-card-contact">
              <div className="info-icon">
                <i className="fas fa-phone"></i>
              </div>
              <div className="info-details">
                <h3>Phone</h3>
                <p>
                  +91 90901 77009<br />
                  +91 90901 55009<br />
                  +91 98610 59070
                </p>
              </div>
            </div>
            <div className="info-card-contact">
              <div className="info-icon">
                <i className="fas fa-envelope"></i>
              </div>
              <div className="info-details">
                <h3>Email</h3>
                <p>
                  bharatfitnessguru@gmail.com
                </p>
              </div>
            </div>
            <div className="info-card-contact">
              <div className="info-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="info-details">
                <h3>Hours</h3>
                <p>
                  Monday – Friday: 5:00 AM – 10:00 PM<br />
                  Saturday: 6:00 AM – 8:00 PM<br />
                  Sunday: 7:00 AM – 6:00 PM
                </p>
              </div>
            </div>
          </div>
          <div className="contact-form-container">
            <div className="contact-form">
              <h3>Send us a Message</h3>

              {submitStatus === 'success' && (
                <div className="alert alert-success">
                  <i className="fas fa-check-circle"></i>
                  Thank you! Your message has been sent successfully. We'll get back to you soon.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="alert alert-error">
                  <i className="fas fa-exclamation-circle"></i>
                  Sorry, there was an error sending your message. Please try again later.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Your Phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Service</option>
                    <option value="Membership Inquiry">Membership Inquiry</option>
                    <option value="Personal Training">Personal Training</option>
                    <option value="Group Classes">Group Classes</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <textarea
                    name="message"
                    rows="4"
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
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

