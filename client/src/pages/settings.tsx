import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ProfileMenu from "@/components/layout/ProfileMenu";

export default function SettingsPage() {
  const [notificationSetting, setNotificationSetting] = useState("smart");
  const [dataScope, setDataScope] = useState("full");
  const [conversationHistory, setConversationHistory] = useState("90days");
  const [teamAccess, setTeamAccess] = useState("only_me");

  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    enabled: true
  });

  const { data: systemConnections = [] } = useQuery({
    queryKey: ['/api/systems'],
    enabled: true
  });

  const connectedSystems = (systemConnections as any[]).filter((conn: any) => conn.isActive);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #FAFBFC 0%, rgba(193, 237, 204, 0.02) 100%)',
      fontFamily: 'Inter, sans-serif',
      position: 'relative'
    }}>
      {/* Profile Menu */}
      <div style={{
        position: 'absolute',
        top: '24px',
        right: '24px',
        zIndex: 1000
      }}>
        <ProfileMenu />
      </div>
      
      <div style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '48px 24px',
        paddingRight: '120px'
      }}>
        {/* Page Header */}
        <div style={{marginBottom: '48px'}}>
          <h1 style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
            fontSize: '2rem',
            color: '#061A40',
            marginBottom: '8px',
            margin: '0 0 8px 0'
          }}>
            Expand Mobius Intelligence
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1.1rem',
            color: '#4A5568',
            margin: '0 0 32px 0',
            lineHeight: '1.6'
          }}>
            The more systems I can access, the better insights I can provide
          </p>
        </div>

        {/* Section 1: Active Intelligence Sources */}
        <div style={{marginBottom: '48px'}}>
          <h2 style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
            color: '#061A40',
            fontSize: '1.5rem',
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>
            ✅ Active Intelligence Sources
          </h2>

          {/* Salesforce Card */}
          {connectedSystems.some((sys: any) => sys.systemType === 'salesforce') && (
            <div style={{
              background: 'linear-gradient(135deg, #FAFBFC 0%, rgba(193, 237, 204, 0.1) 100%)',
              border: '2px solid #C1EDCC',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '16px'
            }}>
              <div style={{display: 'flex', alignItems: 'center', marginBottom: '12px'}}>
                <div style={{
                  fontSize: '2rem',
                  marginRight: '16px'
                }}>💼</div>
                <div>
                  <h3 style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                    color: '#061A40',
                    fontSize: '1.25rem',
                    margin: 0
                  }}>Sales Intelligence</h3>
                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    color: '#718096',
                    fontSize: '0.9rem',
                    margin: 0
                  }}>Connected via Salesforce</p>
                </div>
              </div>
              
              <p style={{
                fontFamily: 'Inter, sans-serif',
                color: '#4A5568',
                marginBottom: '12px',
                margin: '0 0 12px 0'
              }}>I can help you with:</p>
              
              <ul style={{
                fontFamily: 'Inter, sans-serif',
                color: '#4A5568',
                lineHeight: 1.6,
                marginBottom: '16px',
                margin: '0 0 16px 0',
                paddingLeft: '20px'
              }}>
                <li>Revenue forecasting and pipeline health</li>
                <li>Customer relationship insights</li>
                <li>Deal progression and win rates</li>
              </ul>
              
              <div style={{
                background: 'rgba(4, 139, 168, 0.1)',
                color: '#048BA8',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                fontStyle: 'italic'
              }}>
                Recent insight: "Q4 pipeline is 18% ahead of target"
              </div>
            </div>
          )}

          {/* NetSuite Card */}
          {connectedSystems.some((sys: any) => sys.systemType === 'netsuite') && (
            <div style={{
              background: 'linear-gradient(135deg, #FAFBFC 0%, rgba(193, 237, 204, 0.1) 100%)',
              border: '2px solid #C1EDCC',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '32px'
            }}>
              <div style={{display: 'flex', alignItems: 'center', marginBottom: '12px'}}>
                <div style={{
                  fontSize: '2rem',
                  marginRight: '16px'
                }}>💰</div>
                <div>
                  <h3 style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                    color: '#061A40',
                    fontSize: '1.25rem',
                    margin: 0
                  }}>Financial Intelligence</h3>
                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    color: '#718096',
                    fontSize: '0.9rem',
                    margin: 0
                  }}>Connected via NetSuite</p>
                </div>
              </div>
              
              <p style={{
                fontFamily: 'Inter, sans-serif',
                color: '#4A5568',
                marginBottom: '12px',
                margin: '0 0 12px 0'
              }}>I can help you with:</p>
              
              <ul style={{
                fontFamily: 'Inter, sans-serif',
                color: '#4A5568',
                lineHeight: 1.6,
                marginBottom: '16px',
                margin: '0 0 16px 0',
                paddingLeft: '20px'
              }}>
                <li>Cash flow analysis and projections</li>
                <li>Invoice tracking and collections</li>
                <li>Revenue recognition and reporting</li>
              </ul>
              
              <div style={{
                background: 'rgba(4, 139, 168, 0.1)',
                color: '#048BA8',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                fontStyle: 'italic'
              }}>
                Recent insight: "3 high-priority accounts need attention"
              </div>
            </div>
          )}

          {/* Expand Knowledge Section */}
          <div style={{
            background: 'rgba(4, 139, 168, 0.05)',
            border: '2px dashed #048BA8',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <h3 style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              color: '#048BA8',
              fontSize: '1.25rem',
              marginBottom: '12px',
              margin: '0 0 12px 0'
            }}>🔮 Expand My Knowledge</h3>
            
            <p style={{
              fontFamily: 'Inter, sans-serif',
              color: '#4A5568',
              marginBottom: '20px',
              margin: '0 0 20px 0'
            }}>What other business systems do you use?</p>
            
            <button 
              style={{
                background: 'linear-gradient(135deg, #048BA8 0%, #037A96 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '16px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(4, 139, 168, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Browse 170+ Integrations
            </button>
          </div>
        </div>

        {/* Section 2: Notifications & Updates */}
        <div style={{marginTop: '48px', marginBottom: '48px'}}>
          <h2 style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
            color: '#061A40',
            fontSize: '1.5rem',
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>
            🔔 Notifications & Updates
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            color: '#4A5568',
            marginBottom: '24px',
            margin: '0 0 24px 0'
          }}>How should I keep you informed about your business?</p>

          <div>
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              padding: '16px',
              border: notificationSetting === 'smart' ? '2px solid #048BA8' : '2px solid #E2E8F0',
              borderRadius: '8px',
              marginBottom: '12px',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              background: notificationSetting === 'smart' ? 'rgba(4, 139, 168, 0.05)' : 'white'
            }}>
              <input 
                type="radio" 
                name="notifications" 
                value="smart"
                checked={notificationSetting === 'smart'}
                onChange={(e) => setNotificationSetting(e.target.value)}
                style={{marginRight: '12px', marginTop: '2px'}} 
              />
              <div>
                <div style={{color: '#061A40', fontWeight: 600, marginBottom: '4px'}}>Smart notifications (Recommended)</div>
                <div style={{color: '#718096', fontSize: '0.9rem'}}>Alert me to urgent issues and weekly insights</div>
              </div>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              padding: '16px',
              border: notificationSetting === 'daily' ? '2px solid #048BA8' : '2px solid #E2E8F0',
              borderRadius: '8px',
              marginBottom: '12px',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              background: notificationSetting === 'daily' ? 'rgba(4, 139, 168, 0.05)' : 'white'
            }}>
              <input 
                type="radio" 
                name="notifications" 
                value="daily"
                checked={notificationSetting === 'daily'}
                onChange={(e) => setNotificationSetting(e.target.value)}
                style={{marginRight: '12px', marginTop: '2px'}} 
              />
              <div>
                <div style={{color: '#061A40', fontWeight: 600, marginBottom: '4px'}}>Daily briefings</div>
                <div style={{color: '#718096', fontSize: '0.9rem'}}>Morning summary of key business metrics</div>
              </div>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              padding: '16px',
              border: notificationSetting === 'manual' ? '2px solid #048BA8' : '2px solid #E2E8F0',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              background: notificationSetting === 'manual' ? 'rgba(4, 139, 168, 0.05)' : 'white'
            }}>
              <input 
                type="radio" 
                name="notifications" 
                value="manual"
                checked={notificationSetting === 'manual'}
                onChange={(e) => setNotificationSetting(e.target.value)}
                style={{marginRight: '12px', marginTop: '2px'}} 
              />
              <div>
                <div style={{color: '#061A40', fontWeight: 600, marginBottom: '4px'}}>On-demand only</div>
                <div style={{color: '#718096', fontSize: '0.9rem'}}>I'll check in with you manually</div>
              </div>
            </label>
          </div>
        </div>

        {/* Section 3: Privacy & Data */}
        <div style={{marginTop: '48px'}}>
          <h2 style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
            color: '#061A40',
            fontSize: '1.5rem',
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>
            🔒 Privacy & Data
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            color: '#4A5568',
            marginBottom: '24px',
            margin: '0 0 24px 0'
          }}>Your data, your control</p>

          <div>
            <div style={{
              padding: '20px',
              border: '2px solid #E2E8F0',
              borderRadius: '8px',
              marginBottom: '16px',
              background: 'white'
            }}>
              <label style={{
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                color: '#061A40',
                marginBottom: '8px'
              }}>
                Data scope:
              </label>
              <select 
                value={dataScope}
                onChange={(e) => setDataScope(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '16px',
                  background: 'white'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#048BA8';
                  e.target.style.boxShadow = '0 0 0 3px rgba(4, 139, 168, 0.1)';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E2E8F0';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="full">Full access (Recommended)</option>
                <option value="limited">Limited scope</option>
              </select>
            </div>

            <div style={{
              padding: '20px',
              border: '2px solid #E2E8F0',
              borderRadius: '8px',
              marginBottom: '16px',
              background: 'white'
            }}>
              <label style={{
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                color: '#061A40',
                marginBottom: '8px'
              }}>
                Conversation history:
              </label>
              <select 
                value={conversationHistory}
                onChange={(e) => setConversationHistory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '16px',
                  background: 'white'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#048BA8';
                  e.target.style.boxShadow = '0 0 0 3px rgba(4, 139, 168, 0.1)';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E2E8F0';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="30days">Keep for 30 days</option>
                <option value="90days">Keep for 90 days</option>
                <option value="1year">Keep for 1 year</option>
                <option value="forever">Keep forever</option>
              </select>
            </div>

            <div style={{
              padding: '20px',
              border: '2px solid #E2E8F0',
              borderRadius: '8px',
              background: 'white'
            }}>
              <label style={{
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                color: '#061A40',
                marginBottom: '8px'
              }}>
                Team access:
              </label>
              <select 
                value={teamAccess}
                onChange={(e) => setTeamAccess(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '16px',
                  background: 'white'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#048BA8';
                  e.target.style.boxShadow = '0 0 0 3px rgba(4, 139, 168, 0.1)';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E2E8F0';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="only_me">Only me</option>
                <option value="my_team">My team</option>
                <option value="custom">Custom permissions</option>
              </select>
            </div>
          </div>
        </div>

        {/* Encouraging Note */}
        <div style={{
          marginTop: '48px',
          padding: '24px',
          borderRadius: '12px',
          background: 'rgba(193, 237, 204, 0.1)',
          borderLeft: '4px solid #048BA8'
        }}>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            color: '#061A40',
            lineHeight: '1.6',
            margin: 0,
            fontSize: '16px'
          }}>
            💡 Each new connection makes our conversations smarter and more valuable. 
            I learn your business patterns and can provide increasingly personalized insights.
          </p>
        </div>
      </div>
    </div>
  );
}