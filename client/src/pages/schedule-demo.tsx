import { useState } from 'react';

export default function ScheduleDemo() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    arrRange: '',
    dsoRange: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData,
          source: 'schedule_demo',
          timestamp: new Date().toISOString()
        })
      });
      
      // Redirect to thank you page or calendar booking
      window.location.href = `https://calendly.com/mobius-cfo-success/implementation-call?prefill_email=${encodeURIComponent(formData.email)}&prefill_name=${encodeURIComponent(formData.name)}`;
    } catch (error) {
      console.error('Demo scheduling failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7FAFC' }}>
      <div className="max-w-2xl mx-auto p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 
            className="text-3xl font-bold mb-4"
            style={{ color: '#1B3A57' }}
          >
            Schedule Your Implementation Call
          </h1>
          <p 
            className="text-lg"
            style={{ color: '#4A5568' }}
          >
            Meet with our CFO Success team to design your custom collections automation
          </p>
        </div>

        {/* Form */}
        <div 
          className="bg-white rounded-xl p-8 border"
          style={{ borderColor: '#E2E8F0' }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#4A5568' }}
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Sarah Chen"
                  className="w-full p-3 border-2 rounded-lg"
                  style={{ borderColor: '#E2E8F0' }}
                  required
                />
              </div>
              
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#4A5568' }}
                >
                  Work Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="sarah@techflow.com"
                  className="w-full p-3 border-2 rounded-lg"
                  style={{ borderColor: '#E2E8F0' }}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#4A5568' }}
                >
                  Company *
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="TechFlow Solutions"
                  className="w-full p-3 border-2 rounded-lg"
                  style={{ borderColor: '#E2E8F0' }}
                  required
                />
              </div>
              
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#4A5568' }}
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className="w-full p-3 border-2 rounded-lg"
                  style={{ borderColor: '#E2E8F0' }}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#4A5568' }}
                >
                  Annual Recurring Revenue *
                </label>
                <select
                  name="arrRange"
                  value={formData.arrRange}
                  onChange={handleChange}
                  className="w-full p-3 border-2 rounded-lg"
                  style={{ borderColor: '#E2E8F0' }}
                  required
                >
                  <option value="">Select ARR range</option>
                  <option value="1-5M">$1M - $5M</option>
                  <option value="5-15M">$5M - $15M</option>
                  <option value="15-50M">$15M - $50M</option>
                  <option value="50M+">$50M+</option>
                </select>
              </div>
              
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#4A5568' }}
                >
                  Current DSO
                </label>
                <select
                  name="dsoRange"
                  value={formData.dsoRange}
                  onChange={handleChange}
                  className="w-full p-3 border-2 rounded-lg"
                  style={{ borderColor: '#E2E8F0' }}
                >
                  <option value="">Select DSO range</option>
                  <option value="30-40">30-40 days</option>
                  <option value="40-50">40-50 days</option>
                  <option value="50-60">50-60 days</option>
                  <option value="60+">60+ days</option>
                </select>
              </div>
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: '#4A5568' }}
              >
                What's your biggest collections challenge?
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="e.g., Manual follow-ups taking too much time, worried about damaging customer relationships, need better cash flow predictability..."
                rows={4}
                className="w-full p-3 border-2 rounded-lg"
                style={{ borderColor: '#E2E8F0' }}
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full p-4 text-lg font-semibold rounded-lg transition-all duration-200"
              style={{
                backgroundColor: '#F59E0B',
                color: 'white',
                border: 'none',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule My Implementation Call'}
            </button>
          </form>
          
          <p className="text-xs text-center mt-4" style={{ color: '#718096' }}>
            30-minute call • Custom implementation plan • No sales pitch
          </p>
        </div>

        {/* What to Expect */}
        <div className="mt-8 text-center">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#1B3A57' }}>
            What to expect in your call:
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-medium" style={{ color: '#1B3A57' }}>DSO Analysis</h4>
              <p style={{ color: '#4A5568' }}>Review your current collections process and identify optimization opportunities</p>
            </div>
            <div>
              <div className="text-2xl mb-2">⚙️</div>
              <h4 className="font-medium" style={{ color: '#1B3A57' }}>Custom Setup</h4>
              <p style={{ color: '#4A5568' }}>Design your Salesforce + NetSuite integration for maximum impact</p>
            </div>
            <div>
              <div className="text-2xl mb-2">📈</div>
              <h4 className="font-medium" style={{ color: '#1B3A57' }}>ROI Roadmap</h4>
              <p style={{ color: '#4A5568' }}>Get your personalized 60-day implementation and results timeline</p>
            </div>
          </div>
        </div>

        {/* Alternative */}
        <div className="text-center mt-8">
          <button
            onClick={() => window.location.href = '/'}
            className="text-sm underline"
            style={{ color: '#048BA8' }}
          >
            Back to homepage
          </button>
        </div>
      </div>
    </div>
  );
}