import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileMenu from "@/components/layout/ProfileMenu";

export default function HelpPage() {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const navigate = useNavigate();

  const successStories = [
    {
      icon: "💰",
      title: "Found $450K in overdue payments",
      description: "Sarah, CFO at TechCorp, asked \"Which customers owe us money?\" and discovered 3 enterprise accounts that had been overlooked for months.",
      question: "Which customers owe us money?"
    },
    {
      icon: "📈",
      title: "Identified 18% revenue growth opportunity",
      description: "Mike, RevOps Manager, asked about pipeline health and discovered untapped expansion opportunities with existing customers.",
      question: "What deals are stuck in our pipeline?"
    },
    {
      icon: "⚡",
      title: "Reduced reporting time from 5 hours to 5 minutes",
      description: "Lisa, Sales Director, now gets instant answers about deal status instead of manually checking multiple systems every week.",
      question: "Show me our biggest customers"
    }
  ];

  const questionCategories = [
    {
      icon: "💰",
      title: "Revenue Intelligence",
      questions: [
        "Which deals closed but haven't been invoiced yet?",
        "Show me revenue vs target this quarter",
        "Which customers are behind on payments?",
        "What's our cash flow looking like?"
      ]
    },
    {
      icon: "👥",
      title: "Customer Intelligence",
      questions: [
        "Who are our most valuable customers?",
        "Which customers might be at risk of churning?",
        "Show me expansion opportunities",
        "What's our customer satisfaction trend?"
      ]
    },
    {
      icon: "📊",
      title: "Sales Intelligence",
      questions: [
        "What deals need immediate attention?",
        "Which sales reps are performing best?",
        "Show me pipeline health by region",
        "What's our win rate trend?"
      ]
    },
    {
      icon: "⚡",
      title: "Operational Intelligence",
      questions: [
        "Which processes are taking too long?",
        "Where are we losing efficiency?",
        "Show me resource utilization",
        "What's blocking our team productivity?"
      ]
    }
  ];

  const handleTryQuestion = (question: string) => {
    navigate('/', { state: { suggestedQuestion: question } });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #FAFBFC 0%, rgba(193, 237, 204, 0.02) 100%)',
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
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '48px 24px',
        paddingRight: '120px'
      }}>
        {/* Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, #061A40 0%, #048BA8 100%)',
          color: 'white',
          padding: '48px 32px',
          textAlign: 'center',
          borderRadius: '12px',
          marginBottom: '48px'
        }}>
          <h1 style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
            fontSize: '2.5rem',
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>
            Unlock Your Business Intelligence
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1.2rem',
            opacity: 0.9,
            maxWidth: '600px',
            margin: '0 auto 32px auto',
            lineHeight: 1.6
          }}>
            Discover how Mobius transforms the way you understand and act on your business data
          </p>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '16px',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <p style={{marginBottom: '12px', fontSize: '0.9rem', margin: '0 0 12px 0'}}>Try asking me right now:</p>
            <div style={{
              background: 'white',
              color: '#4A5568',
              borderRadius: '6px',
              padding: '12px',
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
            onClick={() => handleTryQuestion("Which customers haven't paid but are still using our services?")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}>
              "Which customers haven't paid but are still using our services?"
            </div>
          </div>
        </div>

        {/* Success Stories */}
        <div style={{marginBottom: '48px'}}>
          <h2 style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
            color: '#061A40',
            fontSize: '2rem',
            textAlign: 'center',
            marginBottom: '32px',
            margin: '0 0 32px 0'
          }}>
            See What Others Accomplish
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {successStories.map((story, index) => (
              <div
                key={index}
                style={{
                  background: 'linear-gradient(135deg, rgba(193, 237, 204, 0.1) 0%, rgba(4, 139, 168, 0.05) 100%)',
                  border: '2px solid #C1EDCC',
                  borderRadius: '12px',
                  padding: '24px',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{fontSize: '2rem', marginBottom: '16px'}}>{story.icon}</div>
                <h3 style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600,
                  color: '#061A40',
                  marginBottom: '12px',
                  margin: '0 0 12px 0'
                }}>
                  {story.title}
                </h3>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#4A5568',
                  lineHeight: 1.6,
                  marginBottom: '16px',
                  margin: '0 0 16px 0'
                }}>
                  {story.description}
                </p>
                <button
                  onClick={() => handleTryQuestion(story.question)}
                  style={{
                    background: '#048BA8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#037A96';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#048BA8';
                  }}
                >
                  Try this question →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Getting Started */}
        <div style={{
          background: '#FAFBFC',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '48px'
        }}>
          <h2 style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
            color: '#061A40',
            fontSize: '1.8rem',
            marginBottom: '24px',
            margin: '0 0 24px 0'
          }}>
            Your First Conversation with Mobius
          </h2>
          
          <div style={{display: 'grid', gap: '24px'}}>
            {/* Step 1 */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#048BA8',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                flexShrink: 0
              }}>1</div>
              <div>
                <h3 style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600,
                  color: '#061A40',
                  marginBottom: '8px',
                  margin: '0 0 8px 0'
                }}>
                  Connect your business systems
                </h3>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#4A5568',
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  Go to Settings and connect Salesforce, NetSuite, or other systems. 
                  This gives Mobius access to your business data for intelligent insights.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#048BA8',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                flexShrink: 0
              }}>2</div>
              <div>
                <h3 style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600,
                  color: '#061A40',
                  marginBottom: '8px',
                  margin: '0 0 8px 0'
                }}>
                  Ask your first business question
                </h3>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#4A5568',
                  lineHeight: 1.6,
                  marginBottom: '12px',
                  margin: '0 0 12px 0'
                }}>
                  Start with something you actually need to know about your business. 
                  Don't worry about perfect phrasing - Mobius understands natural language.
                </p>
                <div style={{
                  background: 'rgba(4, 139, 168, 0.1)',
                  borderLeft: '4px solid #048BA8',
                  padding: '12px 16px',
                  borderRadius: '0 6px 6px 0',
                  fontFamily: 'Inter, sans-serif',
                  fontStyle: 'italic'
                }}>
                  Try: "What deals are stuck in our pipeline?" or "Show me our biggest customers"
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#048BA8',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                flexShrink: 0
              }}>3</div>
              <div>
                <h3 style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600,
                  color: '#061A40',
                  marginBottom: '8px',
                  margin: '0 0 8px 0'
                }}>
                  Follow the conversation
                </h3>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#4A5568',
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  Mobius will provide insights and suggest follow-up questions. 
                  Think of it as having a conversation with your smartest business analyst.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Powerful Questions */}
        <div style={{marginBottom: '48px'}}>
          <h2 style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
            color: '#061A40',
            fontSize: '1.8rem',
            textAlign: 'center',
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>
            Powerful Questions to Ask Mobius
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            color: '#4A5568',
            textAlign: 'center',
            marginBottom: '32px',
            fontSize: '1.1rem',
            margin: '0 0 32px 0'
          }}>
            Copy any of these questions and see what insights emerge
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            {questionCategories.map((category, index) => (
              <div
                key={index}
                style={{
                  background: 'white',
                  border: '2px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '24px',
                  transition: 'border-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#048BA8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <span style={{fontSize: '1.5rem', marginRight: '12px'}}>{category.icon}</span>
                  <h3 style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                    color: '#061A40',
                    margin: 0
                  }}>{category.title}</h3>
                </div>
                
                <div>
                  {category.questions.map((question, qIndex) => (
                    <div
                      key={qIndex}
                      onClick={() => handleTryQuestion(question)}
                      style={{
                        background: '#F7FAFC',
                        borderRadius: '6px',
                        padding: '12px',
                        marginBottom: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontFamily: 'Inter, sans-serif',
                        color: '#4A5568'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(4, 139, 168, 0.1)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#F7FAFC';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      "{question}"
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Encouraging Note */}
        <div style={{
          background: 'rgba(193, 237, 204, 0.1)',
          borderLeft: '4px solid #048BA8',
          borderRadius: '0 12px 12px 0',
          padding: '24px',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
            color: '#061A40',
            marginBottom: '12px',
            margin: '0 0 12px 0'
          }}>
            Ready to unlock your business potential?
          </h3>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            color: '#4A5568',
            lineHeight: 1.6,
            marginBottom: '20px',
            margin: '0 0 20px 0'
          }}>
            The most powerful insights come from asking the right questions. 
            Start with what you need to know today, and let Mobius guide you to deeper understanding.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'linear-gradient(135deg, #048BA8 0%, #037A96 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Start Your First Conversation
          </button>
        </div>
      </div>
    </div>
  );
}