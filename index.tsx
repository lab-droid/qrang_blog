
import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

// --- Configuration ---
const DEVELOPER_NAME = "정혁신";
const APP_NAME = "큐랑 블로그 AI";

// Note: GoogleGenAI instance is now created locally in functions to support API Key switching.

// --- Types ---
interface GeneratedImage {
  url: string;
  type: 'content' | 'thumbnail';
}

interface BlogPost {
  keyword: string;
  title: string;
  content: string;
  images: GeneratedImage[];
  thumbnail: GeneratedImage | null;
}

// --- Styles ---
const styles = {
  container: {
    fontFamily: '"Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
    minHeight: '100vh',
    position: 'relative' as 'relative',
    backgroundColor: '#f0f4f8',
    overflowX: 'hidden' as 'hidden',
    paddingBottom: '80px',
  },
  heroBackground: {
    position: 'absolute' as 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '380px',
    background: 'linear-gradient(135deg, #004e92 0%, #000428 100%)',
    borderBottomLeftRadius: '40px',
    borderBottomRightRadius: '40px',
    zIndex: 0,
    boxShadow: '0 10px 40px rgba(0, 4, 40, 0.3)',
  },
  apiKeyWrapper: {
    position: 'absolute' as 'absolute',
    top: '25px',
    right: '25px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'flex-end',
    gap: '12px',
  },
  apiKeyBtn: {
    padding: '12px 24px',
    borderRadius: '50px',
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  apiKeyCard: {
    background: 'rgba(255, 255, 255, 0.92)',
    padding: '28px',
    borderRadius: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.7)',
    width: '320px',
    animation: 'slideInDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '18px',
  },
  apiKeyInput: {
    padding: '14px 18px',
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    width: '100%',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'all 0.3s ease',
    backgroundColor: '#ffffff',
    color: '#1a202c',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
  },
  verifyBtn: {
    padding: '14px',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    color: '#ffffff',
  },
  contentWrapper: {
    position: 'relative' as 'relative',
    zIndex: 1,
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  header: {
    textAlign: 'center' as 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '3.2rem',
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: '10px',
    letterSpacing: '-1px',
    textShadow: '0 4px 15px rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
  },
  subtitle: {
    fontSize: '1.25rem',
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: '1.5',
  },
  // Step Indicator Styles
  stepContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    maxWidth: '600px',
    margin: '0 auto 40px auto',
    position: 'relative' as 'relative',
  },
  stepLine: {
    position: 'absolute' as 'absolute',
    top: '20px',
    left: '0',
    width: '100%',
    height: '2px',
    backgroundColor: 'rgba(255,255,255,0.3)',
    zIndex: -1,
  },
  stepItem: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    gap: '8px',
    zIndex: 2,
    width: '80px',
  },
  stepCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    transition: 'all 0.3s ease',
    border: '2px solid transparent',
  },
  stepLabel: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.9)',
    marginTop: '5px',
  },
  // Fade In Animation Class
  fadeIn: {
    animation: 'fadeInUp 0.5s ease-out forwards',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '45px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
    marginBottom: '30px',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(255,255,255,0.5)',
    position: 'relative' as 'relative',
    backdropFilter: 'blur(10px)',
  },
  inputGroup: {
    marginBottom: '30px',
  },
  label: {
    fontWeight: '700',
    marginBottom: '12px',
    color: '#1a202c',
    fontSize: '1.1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  input: {
    width: '100%',
    padding: '18px',
    borderRadius: '14px',
    border: '2px solid #e2e8f0',
    fontSize: '1.05rem',
    outline: 'none',
    transition: 'all 0.2s',
    backgroundColor: '#f8fafc',
    color: '#000000',
    fontWeight: '500',
  },
  rangeInput: {
    width: '100%',
    cursor: 'pointer',
    accentColor: '#004e92',
    height: '8px',
    borderRadius: '5px',
    background: '#e2e8f0',
    outline: 'none',
  },
  fileUploadBox: {
    border: '2px dashed #cbd5e1', 
    borderRadius: '14px', 
    padding: '30px', 
    textAlign: 'center' as 'center',
    backgroundColor: '#f8fafc',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
    marginBottom: '10px',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '15px',
    marginTop: '30px',
  },
  button: {
    background: 'linear-gradient(135deg, #004e92 0%, #000428 100%)',
    color: '#fff',
    border: 'none',
    padding: '16px 32px',
    borderRadius: '14px',
    fontSize: '1.15rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'transform 0.1s, box-shadow 0.2s',
    width: '100%',
    boxShadow: '0 8px 20px rgba(0, 78, 146, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  secondaryButton: {
    background: '#e2e8f0',
    color: '#475569',
    border: 'none',
    padding: '14px 24px',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
    whiteSpace: 'nowrap' as 'nowrap',
    height: '100%',
  },
  prevButton: {
    background: '#ffffff',
    color: '#475569',
    border: '2px solid #cbd5e1',
    padding: '16px 32px',
    borderRadius: '14px',
    fontSize: '1.15rem',
    fontWeight: '700',
    cursor: 'pointer',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  actionButton: {
    padding: '8px 16px',
    fontSize: '0.85rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    background: '#fff',
    cursor: 'pointer',
    color: '#475569',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    transition: 'all 0.2s',
  },
  recommendBtnGroup: {
    display: 'flex',
    gap: '10px',
  },
  keywordBtn: {
    padding: '10px 18px',
    borderRadius: '20px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    fontWeight: 600,
    border: 'none',
    transition: 'all 0.2s',
  },
  grid: {
    display: 'grid',
    gap: '15px',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    marginTop: '25px',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    marginTop: '20px',
  },
  listItem: {
    padding: '24px',
    border: '2px solid #f1f5f9',
    borderRadius: '16px',
    marginBottom: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingContainer: {
    textAlign: 'center' as 'center',
    padding: '80px 20px',
  },
  loader: {
    border: '5px solid #e2e8f0',
    borderTop: '5px solid #004e92',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 30px',
  },
  resultContainer: {
    backgroundColor: '#fff',
    padding: '60px',
    borderRadius: '24px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
  },
  blogTitle: {
    fontSize: '2.4rem',
    fontWeight: '800',
    marginBottom: '40px',
    borderBottom: '4px solid #f1f5f9',
    paddingBottom: '30px',
    color: '#1a202c',
    lineHeight: '1.3',
  },
  blogContent: {
    lineHeight: '2',
    fontSize: '1.2rem',
    color: '#334155',
    whiteSpace: 'pre-line' as 'pre-line',
    fontFamily: '"Pretendard", serif',
  },
  blogImageWrapper: {
    margin: '40px 0',
  },
  blogImage: {
    width: '100%',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
    marginBottom: '10px',
  },
  thumbnailContainer: {
    marginTop: '80px',
    textAlign: 'center' as 'center',
    padding: '40px',
    background: '#f8fafc',
    borderRadius: '20px',
    border: '2px dashed #cbd5e1',
  },
  footer: {
    position: 'fixed' as 'fixed',
    bottom: '20px',
    left: '20px',
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: '10px 18px',
    borderRadius: '30px',
    backdropFilter: 'blur(10px)',
    zIndex: 100,
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
  }
};

// --- Helper Functions ---
const fileToGenerativePart = async (file: File) => {
  return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const downloadImage = (url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    alert('클립보드에 복사되었습니다!');
  } catch (err) {
    console.error('Failed to copy!', err);
    alert('복사에 실패했습니다.');
  }
};

const Spinner = () => (
  <div style={styles.loader}>
    <style>{`
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes slideInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
      @keyframes pulseError { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
    `}</style>
  </div>
);

// --- Components ---

// Component for Image Preview with Delete
const ImagePreview = ({ file, onRemove }: { file: File; onRemove: () => void }) => {
  const [preview, setPreview] = useState<string>('');

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div style={{ position: 'relative', width: '100%', paddingTop: '100%', borderRadius: '14px', overflow: 'hidden', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
      {preview && (
        <img 
          src={preview} 
          alt={file.name}
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
            objectFit: 'cover'
          }}
        />
      )}
      <button 
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        style={{
          position: 'absolute', top: '8px', right: '8px',
          background: 'rgba(239, 68, 68, 0.9)', color: 'white', borderRadius: '50%',
          width: '28px', height: '28px', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}
        title="삭제"
      >
        ×
      </button>
      <div style={{ 
          position: 'absolute', bottom: 0, left: 0, width: '100%', 
          background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.75rem', 
          padding: '4px 8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
      }}>
          {file.name}
      </div>
    </div>
  );
};

// Step Indicator Component
const StepIndicator = ({ currentStep, onStepClick, isStepClickable }: { currentStep: number, onStepClick: (step: number) => void, isStepClickable: (step: number) => boolean }) => {
  const steps = [
    { num: 1, label: '키워드 설정' },
    { num: 2, label: '제목 선택' },
    { num: 3, label: '본문 생성' },
    { num: 4, label: '이미지 생성' },
    { num: 5, label: '최종 결과' }
  ];

  return (
    <div style={styles.stepContainer}>
      <div style={styles.stepLine} />
      {steps.map((step) => {
        const isActive = currentStep >= step.num;
        const isCurrent = currentStep === step.num;
        const clickable = isStepClickable(step.num);
        return (
          <div 
            key={step.num} 
            style={{...styles.stepItem, cursor: clickable ? 'pointer' : 'default'}}
            onClick={() => { if (clickable) onStepClick(step.num); }}
          >
            <div style={{
              ...styles.stepCircle,
              backgroundColor: isActive ? '#ffffff' : 'rgba(255,255,255,0.2)',
              color: isActive ? '#004e92' : 'rgba(255,255,255,0.7)',
              boxShadow: isCurrent ? '0 0 0 4px rgba(255,255,255,0.3)' : 'none',
              borderColor: isActive ? '#fff' : 'transparent',
              transition: 'all 0.3s ease',
              transform: clickable && !isCurrent ? 'scale(1.05)' : 'scale(1)',
            }}>
              {step.num}
            </div>
            <span style={{
              ...styles.stepLabel,
              opacity: isActive ? 1 : 0.6,
              transition: 'all 0.3s ease',
            }}>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
};

const App = () => {
  // Step 1: Keywords, Step 2: Title Selection, Step 3: Result
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [isApiKeyValid, setIsApiKeyValid] = useState<boolean>(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(true); // Default to true to force input
  const [loadingMessage, setLoadingMessage] = useState<string>("");

  // Data State
  const [keyword, setKeyword] = useState<string>("");
  const [recommendedKeywords, setRecommendedKeywords] = useState<string[]>([]);
  const [keywordHistory, setKeywordHistory] = useState<string[]>([]); // Track history for infinite generation
  const [imageCount, setImageCount] = useState<number>(4); // Default 4
  const [selectedTitle, setSelectedTitle] = useState<string>("");
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [tempContent, setTempContent] = useState<string>("");
  const [tempImages, setTempImages] = useState<GeneratedImage[]>([]);
  const [tempThumbnail, setTempThumbnail] = useState<GeneratedImage | null>(null);
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [referenceText, setReferenceText] = useState<string>("");
  const [referenceFileNames, setReferenceFileNames] = useState<string[]>([]);
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);

  // New states for high-quality blog & automation
  const [targetAudience, setTargetAudience] = useState<string>("");
  const [blogTone, setBlogTone] = useState<string>("전문적이고 신뢰감 있는");
  const [extraKeywords, setExtraKeywords] = useState<string>("");
  const [isAutomating, setIsAutomating] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current && step === 3) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [step]);

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio && (window as any).aistudio.hasSelectedApiKey) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setIsApiKeyValid(hasKey);
        setShowApiKeyInput(!hasKey);
      }
    };
    checkKey();
  }, []);

  const handleApiKeySelect = async () => {
    if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      // Assume success after triggering openSelectKey to mitigate race condition
      setIsApiKeyValid(true);
      setShowApiKeyInput(false);
    } else {
      alert("API Key selection is not available in this environment.");
    }
  };

  const handleRecommendKeywords = async (type: 'seo' | 'column') => {
    if (!isApiKeyValid) {
      alert("API Key를 먼저 연결해주세요.");
      setShowApiKeyInput(true);
      return;
    }

    setLoading(true);
    setLoadingMessage(type === 'seo' ? "SEO 키워드 분석 중..." : "칼럼 키워드 도출 중...");
    
    // Instantiate locally to use the user's API key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Build exclusion list string
    const excludeList = keywordHistory.join(', ');
    const exclusionPrompt = excludeList.length > 0 
      ? `(중요: 다음 키워드들은 이미 추천했으므로 절대 다시 추천하지 말고 제외하세요: ${excludeList})` 
      : "";

    let prompt = "";
    if (type === 'seo') {
      prompt = `여행 캐리어(Suitcase)와 관련된 네이버 블로그 C-RANK 키워드 중, 현재 검색량이 많고 경쟁력이 있는 'SEO 최적화 키워드' 5개를 추천해줘. 또한 '스냅투고', '패커블백팩', '여행용품' 키워드도 확장하여 함께 고려해줘. ${exclusionPrompt} 오직 키워드만 쉼표로 구분해서 나열해줘.`;
    } else {
      prompt = `'큐랑 캐리어(Q-Rang Carrier)'를 선택해야만 하는 확실한 이유와 매력을 어필하여 구매 욕구를 자극하는 '칼럼형/후기형 키워드' 5개를 추천해줘. 또한 '스냅투고', '패커블백팩', '여행용품' 키워드도 확장하여 함께 고려해줘. ${exclusionPrompt} 캐리어 선택에 결정 장애가 있는 다양한 타겟(신혼부부, 장기 여행자, 비즈니스맨 등)의 고민을 해결해주는 매력적인 문구여야 해. (예: 승무원이 몰래 쓰는 큐랑 캐리어의 비밀, 10만원대 갓성비 큐랑이 명품보다 나은 이유 등). 오직 키워드만 쉼표로 구분해서 나열해줘.`;
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
      });
      const text = response.text || "";
      const keywords = text.split(',').map(k => k.trim()).filter(k => k.length > 0);
      setRecommendedKeywords(keywords);
      
      // Update history
      setKeywordHistory(prev => [...prev, ...keywords]);
    } catch (e) {
      alert("키워드 추천 중 오류가 발생했습니다. API Key를 확인해주세요.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setReferenceImages(prev => {
        // Limit to 20
        const combined = [...prev, ...newFiles];
        return combined.slice(0, 20);
      });
      // Reset input value to allow selecting the same file again if needed (though usually processed by state)
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleReferenceFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files: File[] = Array.from(e.target.files);
      if (files.length > 20) {
        alert("최대 20개까지만 업로드 가능합니다.");
        return;
      }
      
      const fileContents = await Promise.all(files.map((file: File) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string || "");
          reader.readAsText(file);
        });
      }));
      
      setReferenceText(fileContents.join("\n\n---\n\n"));
      setReferenceFileNames(files.map((f: File) => f.name));
    }
  };

  const handleResetAll = () => {
    setStep(1);
    setBlogPost(null);
    setGeneratedTitles([]);
    setSelectedTitle("");
    setKeyword("");
    setReferenceText("");
    setReferenceFileNames([]);
    setReferenceImages([]);
    setRecommendedKeywords([]);
    setKeywordHistory([]); // Reset history
    setImageCount(4);
    setTempContent("");
    setTempImages([]);
    setTempThumbnail(null);
    setTargetAudience("");
    setBlogTone("전문적이고 신뢰감 있는");
    setExtraKeywords("");
    setIsAutomating(false);
    setProgressPercent(0);
  };

  const handleGenerateTitles = async () => {
    if (!isApiKeyValid) {
      alert("API Key를 먼저 연결해주세요.");
      setShowApiKeyInput(true);
      return;
    }
    if (!keyword) {
      alert("키워드를 입력하거나 선택해주세요.");
      return;
    }
    setLoading(true);
    setLoadingMessage("SEO 최적화 제목 생성 중...");
    try {
      // Instantiate locally to use the user's API key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `키워드 '${keyword}'를 활용하여 네이버 검색 노출에 유리한, 클릭을 유도하는 매력적인 여행/제품 리뷰 블로그 제목 5개를 만들어줘. 번호 없이 제목만 한 줄에 하나씩 출력해줘.`,
      });
      const text = response.text || "";
      const titles = text.split('\n').filter(t => t.trim().length > 0);
      setGeneratedTitles(titles);
      setStep(2); // Move to Step 2
    } catch (e) {
      alert("제목 생성 실패. API Key를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleAutomateAll = async () => {
    if (!isApiKeyValid) {
      alert("API Key를 먼저 연결해주세요.");
      setShowApiKeyInput(true);
      return;
    }
    if (!keyword) {
      alert("키워드를 입력하거나 선택해주세요.");
      return;
    }

    const isBackpack = keyword.includes("백팩");
    const isCarrier = keyword.includes("캐리어");

    if (!isBackpack && !isCarrier) {
      alert("키워드에 '백팩' 또는 '캐리어'가 포함되어야 합니다.");
      return;
    }

    setIsAutomating(true);
    setLoading(true);
    setProgressPercent(5);
    setLoadingMessage("SEO 최적화 제목 생성 중...");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // 1. Title Generation
      const titleRes = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `키워드 '${keyword}'를 활용하여 네이버 검색 노출에 유리한, 클릭을 유도하는 매력적인 여행/제품 리뷰 블로그 제목 5개를 만들어줘. 번호 없이 제목만 한 줄에 하나씩 출력해줘.`,
      });
      const titles = (titleRes.text || "").split('\n').filter(t => t.trim().length > 0);
      const autoTitle = titles[0] || `${keyword} 완벽 리뷰`;
      setSelectedTitle(autoTitle);
      setGeneratedTitles(titles);
      setProgressPercent(15);

      // 2. Content Generation
      setLoadingMessage("C-RANK 로직 적용하여 본문 작성 중...");
      const brandName = isBackpack ? "스냅투고(SnapToGo)" : "큐랑(Q-Rang)";
      
      const BACKPACK_USP = `
[스냅투고 멀티패커블 백팩 USP]
1. 35L 대용량 수납 가능
2. 접이식 멀티패커블 백팩 (접으면 키링 디자인, 펼치면 백팩으로 쓸 수 있습니다)
3. 백팩으로 쓰지 않을 때의 귀여움 (가방 모양의 키링으로 귀엽게 연출 가능)
4. 200g 초경량(커피보다 가벼운 무게)
5. 3가지 색상 선택(그린, 네이비, 버건디)
6. 스트랩으로 어디든 걸쳐서 사용 가능
7. 앞포켓, 미니 포켓으로 추가 수납 가능
      `;

      const CARRIER_USP = `
[큐랑 캐리어(Q-Rang Carrier) USP]
1. "여행은 현관문을 나서는 순간부터 시작된다": 일상과 여행의 경계를 허무는 라이프스타일 아이템.
2. "극강의 편리함": 360도 무소음 휠, 미친 수납력.
3. "숨겨진 위트, 큐-아이즈(Q-Eyes)": 가방 안쪽에 숨겨진 윙크하는 눈 디테일.
4. 압도적인 내구성 (PC 소재), TSA 락 잠금, 감각적인 컬러.
      `;

      const productInfo = isBackpack ? BACKPACK_USP : CARRIER_USP;

      let promptContents = `
          당신은 '${brandName}' 브랜드의 공식 전문 에디터입니다.
          키워드: ${keyword}
          제목: ${autoTitle}
          타겟 독자: ${targetAudience || '일반 소비자'}
          글의 톤앤매너: ${blogTone}
          ${extraKeywords ? `필수 포함 키워드: ${extraKeywords}` : ''}
          
          목표: 이 글을 읽은 독자가 제품을 사고 싶어 견딜 수 없게 만들어 구매 전환을 극대화하는 것.

          [브랜드 철학 및 USP]
          ${productInfo}
          
          다음 조건에 맞춰 블로그 글을 작성하세요:
          1. 분량: 공백 포함 1500자 이상 2000자 미만.
          2. 서론: 해당 제품군(캐리어 또는 백팩) 선택에 대한 독자의 고민에 깊이 공감하며 글을 시작하세요.
          3. 본론: 제공된 USP를 바탕으로 제품의 장점을 구체적으로 스토리텔링하세요. 단순 나열이 아닌 실제 상황에 대입하여 설득하세요.
          4. 결론: "결국 정답은 ${brandName}입니다"라는 확신을 심어주고, 지금 사야 하는 이유를 강조하세요.
          5. **Q&A 추가**: 결론 하단에 본문 내용을 바탕으로 구매 예정자가 가장 궁금해할 만한 '자주 묻는 질문(Q&A)' 3가지를 질문과 답변 형식으로 작성하여 추가하세요.
          6. 마지막 줄 CTA: "[${brandName} 최저가 보러가기] ${isBackpack ? 'https://snaptogo.co.kr' : 'https://qrang.co.kr'}"
          7. 톤앤매너: 신뢰감 있으면서도 위트 있고, 소비자의 마음을 꿰뚫어 보는 듯한 통찰력 있는 톤.
          8. 마크다운 형식을 사용하지 말고 일반 텍스트로 줄바꿈을 활용해 작성하세요.
      `;

      if (referenceText) {
        promptContents += `
          
          [참고 원고 스타일 가이드]
          아래 제공된 참고 원고의 문체, 구성, 말투를 깊이 분석하여 이와 유사한 스타일로 글을 작성해 주세요.
          ---
          ${referenceText}
          ---
        `;
      }

      const contentResponse = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: promptContents,
      });
      const autoContent = contentResponse.text || "내용 생성 실패";
      setTempContent(autoContent);
      setProgressPercent(40);

      // 3. Image Generation
      setLoadingMessage(`본문 흐름에 맞춘 고화질 이미지 ${imageCount}장 생성 중...`);
      const generatedImages: GeneratedImage[] = [];
      const refImageParts = await Promise.all(referenceImages.map(fileToGenerativePart));
      
      const sellingPoints = [
        "360도 무소음 휠", "미친 수납력", "PC 소재 내구성", 
        "TSA 락 잠금", "감각적인 컬러", "부드러운 핸들링",
        "가벼운 무게", "히든 포켓", "프리미엄 소재"
      ];

      for (let i = 0; i < imageCount; i++) {
        try {
          let stepRole = "";
          let sceneDescription = "";
          let overlayText = "";

          if (i === 0) {
            stepRole = "Step 1: Hook (Attention & Problem)";
            sceneDescription = "블로그 도입부. 시선을 사로잡는 강렬한 비주얼. 여행 준비의 설렘이나 캐리어 선택의 고민을 함축적으로 표현. 3D 아이소메트릭 또는 세련된 플랫 디자인.";
            overlayText = `여행의 시작, ${keyword}`;
          } else if (i === imageCount - 1) {
             stepRole = "Step 4: CTA (Conclusion)";
             sceneDescription = "블로그 결론. 제품과 함께하는 완벽한 여행의 마무리. 신뢰감을 주는 비즈니스 톤의 이미지.";
             overlayText = "지금 바로 시작하세요";
          } else {
             const uniquePoint = sellingPoints[(i - 1) % sellingPoints.length];
             const isConceptPhase = i < (imageCount / 2);
             
             if (isConceptPhase) {
                stepRole = "Step 2: Concept (Detailed Explanation)";
                sceneDescription = "제품의 구체적인 특징이나 현상을 설명. 전문적인 편집 디자인 스타일로 표현.";
                overlayText = uniquePoint;
             } else {
                stepRole = "Step 3: Solution (Benefit Visualization)";
                sceneDescription = "이 제품이 주는 핵심 이점(편안함, 내구성, 스타일)을 시각화. 세련된 이동 모습.";
                overlayText = `완벽한 ${uniquePoint}`;
             }
          }

          const imagePrompt = `
            [Design & Style Directive]
            - Style: Professional Editorial Design (Flat Design or Sophisticated 3D Isometric).
            - Quality: 8K resolution, sharp details.
            - Tone: Trustworthy Business Tone with distinct Accent Colors.
            
            [Content Structure: ${stepRole} - Image ${i + 1}/${imageCount}]
            - Context: ${sceneDescription}
            - Connection: Ensure the visual flow matches the generated blog content: "${autoContent.substring(0, 500)}..."
            
            [CRITICAL: Product Consistency]
            - Model: Use Gemini 3.0 PRO Image Generation.
            - The image MUST feature the '${isBackpack ? 'SnapToGo Multi-Packable Backpack' : 'Q-Rang Carrier'}' exactly as shown in the uploaded reference images.
            - IMPORTANT: The product's main body, shape, and core design MUST NOT CHANGE. Angles and compositions can vary, but the product identity must be identical to the reference.
            - Do NOT introduce generic ${isBackpack ? 'backpacks' : 'suitcases'} or different designs.
            - 제품/참고 이미지를 활용하여 이미지를 생성해야 합니다. 제품/참고 이미지 외 제품을 절대 포함하여 생성하지 않습니다.

            [Text Rendering: KOREAN TEXT]
            - You MUST render the following Korean text clearly and legibly in the image: "${overlayText}"
            - CRITICAL: The Korean text must be perfectly rendered without any typos, broken characters, or garbled text.
            - Font style: Modern, bold, sans-serif.
            - Ensure high contrast between text and background.

            Generate a high-quality blog image fitting the '${stepRole}' description with the text "${overlayText}".
          `;
          
          const parts: any[] = [...refImageParts, { text: imagePrompt }];

          const imgResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: { parts },
            config: {
              imageConfig: {
                aspectRatio: "16:9",
                imageSize: "2K"
              }
            }
          });

          for (const part of imgResponse.candidates?.[0]?.content?.parts || []) {
             if (part.inlineData) {
                generatedImages.push({
                  url: `data:image/png;base64,${part.inlineData.data}`,
                  type: 'content'
                });
             }
          }
        } catch (err) {
          console.error("Image generation error", err);
        }
        setProgressPercent(40 + Math.floor((50 / imageCount) * (i + 1)));
      }

      // 4. Thumbnail Generation
      setLoadingMessage("클릭을 부르는 썸네일 생성 중...");
      let autoThumbnail: GeneratedImage | null = null;
      try {
         const thumbPrompt = `
            1:1 비율 유튜브/블로그 썸네일 디자인.
            중앙에 '${keyword}'라는 한국어 텍스트와 "지금 떠나요" 또는 "리뷰" 같은 부제가 매우 크고 잘 보이게 배치.
            스타일: 고채도, 눈에 확 띄는 디자인. 텍스트 가독성 최우선. 100% 한국어 텍스트 렌더링.
            CRITICAL: Perfect Korean text rendering.
         `;
         const thumbResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: { parts: [{ text: thumbPrompt }] },
             config: {
              imageConfig: {
                aspectRatio: "1:1",
                imageSize: "1K"
              }
            }
         });
         
         const thumbPart = thumbResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
         if (thumbPart && thumbPart.inlineData) {
           autoThumbnail = {
             url: `data:image/png;base64,${thumbPart.inlineData.data}`,
             type: 'thumbnail'
           };
         }
      } catch (err) {
        console.error("Thumbnail error", err);
      }
      setTempImages(generatedImages);
      setTempThumbnail(autoThumbnail);
      setProgressPercent(95);

      // 5. Finalize
      setBlogPost({
        keyword,
        title: autoTitle,
        content: autoContent,
        images: generatedImages,
        thumbnail: autoThumbnail
      });
      
      setProgressPercent(100);
      setTimeout(() => {
        setIsAutomating(false);
        setStep(5);
      }, 800);

    } catch (e) {
      alert("자동화 처리 중 오류가 발생했습니다.");
      console.error(e);
      setIsAutomating(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!isApiKeyValid) {
      alert("API Key를 먼저 연결해주세요.");
      setShowApiKeyInput(true);
      return;
    }

    setStep(3); 
    setLoading(true);

    try {
      setLoadingMessage("C-RANK 로직 적용하여 본문 작성 중...");
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const isBackpack = keyword.includes("백팩");
      const brandName = isBackpack ? "스냅투고(SnapToGo)" : "큐랑(Q-Rang)";

      const BACKPACK_USP = `
[스냅투고 멀티패커블 백팩 USP]
1. 35L 대용량 수납 가능
2. 접이식 멀티패커블 백팩 (접으면 키링 디자인, 펼치면 백팩으로 쓸 수 있습니다)
3. 백팩으로 쓰지 않을 때의 귀여움 (가방 모양의 키링으로 귀엽게 연출 가능)
4. 200g 초경량(커피보다 가벼운 무게)
5. 3가지 색상 선택(그린, 네이비, 버건디)
6. 스트랩으로 어디든 걸쳐서 사용 가능
7. 앞포켓, 미니 포켓으로 추가 수납 가능
      `;

      const CARRIER_USP = `
[큐랑 캐리어(Q-Rang Carrier) USP]
1. "여행은 현관문을 나서는 순간부터 시작된다": 일상과 여행의 경계를 허무는 라이프스타일 아이템.
2. "극강의 편리함": 360도 무소음 휠, 미친 수납력.
3. "숨겨진 위트, 큐-아이즈(Q-Eyes)": 가방 안쪽에 숨겨진 윙크하는 눈 디테일.
4. 압도적인 내구성 (PC 소재), TSA 락 잠금, 감각적인 컬러.
      `;

      const productInfo = isBackpack ? BACKPACK_USP : CARRIER_USP;

      let promptContents = `
          당신은 '${brandName}' 브랜드의 공식 전문 에디터입니다.
          키워드: ${keyword}
          제목: ${selectedTitle}
          타겟 독자: ${targetAudience || '일반 소비자'}
          글의 톤앤매너: ${blogTone}
          ${extraKeywords ? `필수 포함 키워드: ${extraKeywords}` : ''}
          
          목표: 이 글을 읽은 독자가 제품을 사고 싶어 견딜 수 없게 만들어 구매 전환을 극대화하는 것.

          [브랜드 철학 및 USP]
          ${productInfo}
          
          다음 조건에 맞춰 블로그 글을 작성하세요:
          1. 분량: 공백 포함 1500자 이상 2000자 미만.
          2. 서론: 해당 제품군(캐리어 또는 백팩) 선택에 대한 독자의 고민에 깊이 공감하며 글을 시작하세요.
          3. 본론: 제공된 USP를 바탕으로 제품의 장점을 구체적으로 스토리텔링하세요. 단순 나열이 아닌 실제 상황에 대입하여 설득하세요.
          4. 결론: "결국 정답은 ${brandName}입니다"라는 확신을 심어주고, 지금 사야 하는 이유를 강조하세요.
          5. **Q&A 추가**: 결론 하단에 본문 내용을 바탕으로 구매 예정자가 가장 궁금해할 만한 '자주 묻는 질문(Q&A)' 3가지를 질문과 답변 형식으로 작성하여 추가하세요.
          6. 마지막 줄 CTA: "[${brandName} 최저가 보러가기] ${isBackpack ? 'https://snaptogo.co.kr' : 'https://qrang.co.kr'}"
          7. 톤앤매너: 신뢰감 있으면서도 위트 있고, 소비자의 마음을 꿰뚫어 보는 듯한 통찰력 있는 톤.
          8. 마크다운 형식을 사용하지 말고 일반 텍스트로 줄바꿈을 활용해 작성하세요.
      `;

      if (referenceText) {
        promptContents += `
          
          [참고 원고 스타일 가이드]
          아래 제공된 참고 원고의 문체, 구성, 말투를 깊이 분석하여 이와 유사한 스타일로 글을 작성해 주세요.
          ---
          ${referenceText}
          ---
        `;
      }

      const contentResponse = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: promptContents,
      });
      const contentText = contentResponse.text || "내용 생성 실패";
      setTempContent(contentText);
      setStep(3);

    } catch (e) {
      alert("콘텐츠 생성 중 오류가 발생했습니다.");
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImages = async () => {
    if (!isApiKeyValid) {
      alert("API Key를 먼저 연결해주세요.");
      setShowApiKeyInput(true);
      return;
    }
    if (!tempContent) {
      alert("본문이 생성되지 않았습니다.");
      return;
    }

    const isBackpack = keyword.includes("백팩");
    const isCarrier = keyword.includes("캐리어");

    setStep(4);
    setLoading(true);
    setLoadingMessage(`본문 흐름에 맞춘 고화질 이미지 ${imageCount}장 생성 중...`);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const generatedImages: GeneratedImage[] = [];
      const refImageParts = await Promise.all(referenceImages.map(fileToGenerativePart));
      
      const sellingPoints = [
        "360도 무소음 휠", "미친 수납력", "PC 소재 내구성", 
        "TSA 락 잠금", "감각적인 컬러", "부드러운 핸들링",
        "가벼운 무게", "히든 포켓", "프리미엄 소재"
      ];

      for (let i = 0; i < imageCount; i++) {
        try {
          let stepRole = "";
          let sceneDescription = "";
          let overlayText = "";

          if (i === 0) {
            stepRole = "Step 1: Hook (Attention & Problem)";
            sceneDescription = "블로그 도입부. 시선을 사로잡는 강렬한 비주얼. 여행 준비의 설렘이나 캐리어 선택의 고민을 함축적으로 표현. 3D 아이소메트릭 또는 세련된 플랫 디자인.";
            overlayText = `여행의 시작, ${keyword}`;
          } else if (i === imageCount - 1) {
             stepRole = "Step 4: CTA (Conclusion)";
             sceneDescription = "블로그 결론. 제품과 함께하는 완벽한 여행의 마무리. 신뢰감을 주는 비즈니스 톤의 이미지.";
             overlayText = "지금 바로 시작하세요";
          } else {
             const uniquePoint = sellingPoints[(i - 1) % sellingPoints.length];
             const isConceptPhase = i < (imageCount / 2);
             
             if (isConceptPhase) {
                stepRole = "Step 2: Concept (Detailed Explanation)";
                sceneDescription = "제품의 구체적인 특징이나 현상을 설명. 전문적인 편집 디자인 스타일로 표현.";
                overlayText = uniquePoint;
             } else {
                stepRole = "Step 3: Solution (Benefit Visualization)";
                sceneDescription = "이 제품이 주는 핵심 이점(편안함, 내구성, 스타일)을 시각화. 세련된 이동 모습.";
                overlayText = `완벽한 ${uniquePoint}`;
             }
          }

          const imagePrompt = `
            [Design & Style Directive]
            - Style: Professional Editorial Design (Flat Design or Sophisticated 3D Isometric).
            - Quality: 8K resolution, sharp details.
            - Tone: Trustworthy Business Tone with distinct Accent Colors.
            
            [Content Structure: ${stepRole} - Image ${i + 1}/${imageCount}]
            - Context: ${sceneDescription}
            - Connection: Ensure the visual flow matches the generated blog content: "${tempContent.substring(0, 500)}..."
            
            [CRITICAL: Product Consistency]
            - Model: Use Gemini 3.0 PRO Image Generation.
            - The image MUST feature the '${isBackpack ? 'SnapToGo Multi-Packable Backpack' : 'Q-Rang Carrier'}' exactly as shown in the uploaded reference images.
            - IMPORTANT: The product's main body, shape, and core design MUST NOT CHANGE. Angles and compositions can vary, but the product identity must be identical to the reference.
            - Do NOT introduce generic ${isBackpack ? 'backpacks' : 'suitcases'} or different designs.
            - 제품/참고 이미지를 활용하여 이미지를 생성해야 합니다. 제품/참고 이미지 외 제품을 절대 포함하여 생성하지 않습니다.

            [Text Rendering: KOREAN TEXT]
            - You MUST render the following Korean text clearly and legibly in the image: "${overlayText}"
            - CRITICAL: The Korean text must be perfectly rendered without any typos, broken characters, or garbled text.
            - Font style: Modern, bold, sans-serif.
            - Ensure high contrast between text and background.

            Generate a high-quality blog image fitting the '${stepRole}' description with the text "${overlayText}".
          `;
          
          const parts: any[] = [...refImageParts, { text: imagePrompt }];

          const imgResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: { parts },
            config: {
              imageConfig: {
                aspectRatio: "16:9",
                imageSize: "2K"
              }
            }
          });

          for (const part of imgResponse.candidates?.[0]?.content?.parts || []) {
             if (part.inlineData) {
                generatedImages.push({
                  url: `data:image/png;base64,${part.inlineData.data}`,
                  type: 'content'
                });
             }
          }
        } catch (err) {
          console.error("Image generation error", err);
        }
      }

      setLoadingMessage("클릭을 부르는 썸네일 생성 중...");
      let thumbnail: GeneratedImage | null = null;
      try {
         const thumbPrompt = `
            1:1 비율 유튜브/블로그 썸네일 디자인.
            중앙에 '${keyword}'라는 한국어 텍스트와 "지금 떠나요" 또는 "리뷰" 같은 부제가 매우 크고 잘 보이게 배치.
            스타일: 고채도, 눈에 확 띄는 디자인. 텍스트 가독성 최우선. 100% 한국어 텍스트 렌더링.
            CRITICAL: Perfect Korean text rendering.
         `;
         const thumbResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: { parts: [{ text: thumbPrompt }] },
             config: {
              imageConfig: {
                aspectRatio: "1:1",
                imageSize: "1K"
              }
            }
         });
         
         const thumbPart = thumbResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
         if (thumbPart && thumbPart.inlineData) {
           thumbnail = {
             url: `data:image/png;base64,${thumbPart.inlineData.data}`,
             type: 'thumbnail'
           };
         }
      } catch (err) {
        console.error("Thumbnail error", err);
      }

      setBlogPost({
        keyword,
        title: selectedTitle,
        content: tempContent,
        images: generatedImages,
        thumbnail: thumbnail
      });
      setStep(4);

    } catch (e) {
      alert("이미지 생성 중 오류가 발생했습니다.");
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAllImages = async () => {
    if (!blogPost) return;
    
    // Download content images
    for (let i = 0; i < blogPost.images.length; i++) {
        downloadImage(blogPost.images[i].url, `blog_image_${i + 1}.png`);
        await new Promise(resolve => setTimeout(resolve, 300)); 
    }

    // Download thumbnail if exists
    if (blogPost.thumbnail) {
        await new Promise(resolve => setTimeout(resolve, 300));
        downloadImage(blogPost.thumbnail.url, `thumbnail.png`);
    }
  };

  const renderContentWithImages = (content: string, images: GeneratedImage[]) => {
    const paragraphs = content.split('\n\n');
    const result = [];
    const imageInterval = Math.ceil(paragraphs.length / (images.length + 1));
    let imgIndex = 0;

    for (let i = 0; i < paragraphs.length; i++) {
      result.push(<p key={`p-${i}`} style={{ marginBottom: '1.5em' }}>{paragraphs[i]}</p>);
      if ((i + 1) % imageInterval === 0 && imgIndex < images.length) {
        const currentIndex = imgIndex; // Fix closure issue
        result.push(
          <div key={`img-wrap-${currentIndex}`} style={styles.blogImageWrapper}>
            <img 
              src={images[currentIndex].url} 
              alt={`Generated content ${currentIndex}`} 
              style={styles.blogImage}
            />
            <div style={{ textAlign: 'right' }}>
              <button 
                style={styles.actionButton}
                onClick={() => downloadImage(images[currentIndex].url, `blog_image_${currentIndex + 1}.png`)}
              >
                💾 이미지 다운로드
              </button>
            </div>
          </div>
        );
        imgIndex++;
      }
    }
    while (imgIndex < images.length) {
       const currentIndex = imgIndex; // Fix closure issue
       result.push(
          <div key={`img-wrap-${currentIndex}`} style={styles.blogImageWrapper}>
            <img 
              src={images[currentIndex].url} 
              alt={`Generated content ${currentIndex}`} 
              style={styles.blogImage}
            />
            <div style={{ textAlign: 'right' }}>
              <button 
                style={styles.actionButton}
                onClick={() => downloadImage(images[currentIndex].url, `blog_image_${currentIndex + 1}.png`)}
              >
                💾 이미지 다운로드
              </button>
            </div>
          </div>
        );
        imgIndex++;
    }
    return result;
  };

  return (
    <div style={styles.container}>
      <div style={styles.heroBackground} />
      
      <div style={styles.apiKeyWrapper}>
        <button 
          style={{
            ...styles.apiKeyBtn,
            background: isApiKeyValid 
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.8) 0%, rgba(5, 150, 105, 0.9) 100%)' 
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%)',
            color: '#ffffff',
            border: isApiKeyValid ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255, 255, 255, 0.3)',
            animation: isApiKeyValid ? 'none' : 'pulseError 2s infinite',
            transform: showApiKeyInput ? 'scale(0.95)' : 'scale(1)',
            boxShadow: isApiKeyValid ? '0 10px 25px rgba(16, 185, 129, 0.4)' : '0 10px 25px rgba(0,0,0,0.2)',
          }} 
          onClick={() => setShowApiKeyInput(!showApiKeyInput)}
        >
          <span style={{ fontSize: '1.2rem' }}>{isApiKeyValid ? '🛡️' : '🔑'}</span>
          {isApiKeyValid ? 'API 연결됨' : 'API Key 미설정'}
          <span style={{ 
            marginLeft: '4px', 
            transition: 'transform 0.3s', 
            transform: showApiKeyInput ? 'rotate(180deg)' : 'rotate(0deg)' 
          }}>▼</span>
        </button>
        
        {showApiKeyInput && (
          <div style={styles.apiKeyCard}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' }}>Gemini API 설정</h3>
                <div style={{ 
                  width: '10px', 
                  height: '10px', 
                  borderRadius: '50%', 
                  backgroundColor: isApiKeyValid ? '#10b981' : '#ef4444',
                  boxShadow: isApiKeyValid ? '0 0 10px #10b981' : '0 0 10px #ef4444'
                }} />
             </div>

             <button 
                onClick={handleApiKeySelect}
                style={{ 
                  ...styles.verifyBtn, 
                  background: isApiKeyValid 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                    : 'linear-gradient(135deg, #004e92 0%, #000428 100%)',
                  boxShadow: isApiKeyValid ? '0 8px 20px rgba(16, 185, 129, 0.3)' : '0 8px 20px rgba(0, 78, 146, 0.2)',
                }}
             >
               {isApiKeyValid ? 'API Key 재설정' : 'API Key 선택하기'}
             </button>

             <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '15px' }}>
               <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 8px 0', lineHeight: '1.5' }}>
                 💡 <strong>필수 사항:</strong> 고품질 이미지 생성을 위해 결제가 활성화된 Google Cloud 프로젝트의 API Key가 필요합니다.
               </p>
               <a 
                 href="https://ai.google.dev/gemini-api/docs/billing" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 style={{ 
                   fontSize: '0.8rem', 
                   color: '#004e92', 
                   textDecoration: 'none', 
                   fontWeight: '700',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '4px'
                 }}
               >
                 결제 설정 가이드 보기 <span style={{ fontSize: '1rem' }}>↗</span>
               </a>
             </div>
          </div>
        )}
      </div>

      <div style={styles.contentWrapper}>
        <header style={styles.header}>
          <h1 style={styles.title}>
            <span>🧳</span> 
            {APP_NAME}
          </h1>
          <p style={styles.subtitle}>
            여행의 시작은 캐리어, 블로그의 시작은 큐랑 AI.
          </p>
        </header>

        <StepIndicator 
          currentStep={step} 
          onStepClick={(s) => setStep(s)}
          isStepClickable={(s) => {
            if (s < step) return true;
            if (s === 2 && generatedTitles.length > 0) return true;
            if (s === 3 && selectedTitle) return true;
            if (s === 4 && tempContent) return true;
            if (s === 5 && blogPost) return true;
            return false;
          }}
        />

        {/* Step 1: Keyword Setup */}
        {step === 1 && (
          <div style={{ ...styles.card, ...styles.fadeIn }}>
            <h2 style={{ marginBottom: '30px', color: '#1e293b', fontSize: '1.6rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '20px' }}>
              ✨ 블로그 포스팅 설정
            </h2>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>🏷️ 메인 키워드</label>
              <input 
                style={styles.input} 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="예: 24인치 여행용 캐리어, 기내용 캐리어 추천"
              />
              
              <div style={{ marginTop: '15px' }}>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '8px', fontWeight: 600 }}>AI 키워드 추천:</p>
                <div style={styles.recommendBtnGroup}>
                  <button 
                    onClick={() => handleRecommendKeywords('seo')}
                    disabled={loading}
                    style={{
                      ...styles.secondaryButton,
                      background: '#e0f2fe',
                      color: '#0369a1',
                      border: '1px solid #bae6fd'
                    }}
                  >
                    🔍 SEO 최적화 키워드 추천
                  </button>
                  <button 
                    onClick={() => handleRecommendKeywords('column')}
                    disabled={loading}
                    style={{
                      ...styles.secondaryButton,
                      background: '#f3e8ff',
                      color: '#7e22ce',
                      border: '1px solid #e9d5ff'
                    }}
                  >
                    🖊️ 칼럼 키워드 추천
                  </button>
                </div>
              </div>

              {recommendedKeywords.length > 0 && (
                <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px', background: '#f8fafc', padding: '15px', borderRadius: '12px' }}>
                  {recommendedKeywords.map((k, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setKeyword(k)}
                      style={{
                        ...styles.keywordBtn,
                        background: keyword === k ? '#004e92' : '#ffffff',
                        color: keyword === k ? '#ffffff' : '#334155',
                        border: '1px solid #cbd5e1',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>🖼️ 생성할 이미지 개수 (3~10장)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <input 
                  type="range" 
                  min="3" 
                  max="10" 
                  value={imageCount} 
                  onChange={(e) => setImageCount(Number(e.target.value))}
                  style={styles.rangeInput}
                />
                <span style={{ fontWeight: 'bold', fontSize: '1.4rem', color: '#004e92', minWidth: '50px', textAlign: 'right' }}>
                  {imageCount}장
                </span>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>📝 참고 글 원고 파일 (선택사항, 최대 20개, .txt/.md)</label>
              <div 
                style={styles.fileUploadBox}
                onClick={() => document.getElementById('text-upload')?.click()}
              >
                 <input 
                  id="text-upload"
                  type="file" 
                  accept=".txt,.md" 
                  multiple
                  onChange={handleReferenceFileUpload}
                  style={{ display: 'none' }}
                />
                <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '10px' }}>📄</span>
                <span style={{ color: '#64748b', fontWeight: 500 }}>
                  {referenceFileNames.length > 0 
                    ? `${referenceFileNames.length}개의 파일이 로드되었습니다. (${referenceFileNames[0]} 등)` 
                    : '참고할 원고 파일을 선택하세요 (스타일 반영, 최대 20개)'}
                </span>
              </div>
              {referenceFileNames.length > 0 && (
                <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#64748b' }}>
                  <ul>
                    {referenceFileNames.map((name, idx) => (
                      <li key={idx}>{name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>📷 제품/참고 이미지 (선택사항, 최대 20장)</label>
              <div 
                style={styles.fileUploadBox} 
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input 
                  id="file-upload"
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '10px' }}>🖼️</span>
                <span style={{ color: '#64748b', fontWeight: 500 }}>
                  클릭하여 이미지를 업로드하세요<br/>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>(최대 20장, JPG/PNG)</span>
                </span>
              </div>
              
              {referenceImages.length > 0 && (
                <div style={styles.grid}>
                   {referenceImages.map((file, i) => (
                     <div key={i} style={{ width: '100%', minWidth: '100px' }}>
                        <ImagePreview file={file} onRemove={() => handleRemoveImage(i)} />
                     </div>
                   ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={styles.label}>생성할 이미지 개수</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <input 
                  type="range" 
                  min="1" max="10" 
                  value={imageCount} 
                  onChange={(e) => setImageCount(parseInt(e.target.value))}
                  style={styles.rangeInput}
                />
                <span style={{ fontWeight: 'bold', color: '#004e92', minWidth: '40px' }}>{imageCount}장</span>
              </div>
            </div>

            <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '15px', fontWeight: 700 }}>✨ 고퀄리티 블로그 설정 (선택)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{...styles.label, fontSize: '0.9rem'}}>타겟 독자</label>
                  <input 
                    type="text" 
                    style={{...styles.input, padding: '10px', fontSize: '0.9rem'}} 
                    placeholder="예: 2030 직장인, 대학생" 
                    value={targetAudience} 
                    onChange={(e) => setTargetAudience(e.target.value)} 
                  />
                </div>
                <div>
                  <label style={{...styles.label, fontSize: '0.9rem'}}>블로그 톤앤매너</label>
                  <select 
                    style={{...styles.input, padding: '10px', fontSize: '0.9rem'}} 
                    value={blogTone} 
                    onChange={(e) => setBlogTone(e.target.value)}
                  >
                    <option value="전문적이고 신뢰감 있는">전문적이고 신뢰감 있는</option>
                    <option value="친근하고 발랄한">친근하고 발랄한</option>
                    <option value="감성적이고 차분한">감성적이고 차분한</option>
                    <option value="유머러스하고 재치있는">유머러스하고 재치있는</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '15px' }}>
                <label style={{...styles.label, fontSize: '0.9rem'}}>필수 포함 키워드</label>
                <input 
                  type="text" 
                  style={{...styles.input, padding: '10px', fontSize: '0.9rem'}} 
                  placeholder="예: 가성비, 기내용, 출장용 (쉼표로 구분)" 
                  value={extraKeywords} 
                  onChange={(e) => setExtraKeywords(e.target.value)} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
              <button style={{...styles.button, flex: 1, marginTop: 0}} onClick={handleGenerateTitles} disabled={loading || !keyword}>
                {loading ? 'AI 분석 중...' : '단계별로 시작하기 (제목 생성) →'}
              </button>
              <button 
                style={{
                  ...styles.button, 
                  flex: 1.5, 
                  marginTop: 0,
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                  boxShadow: '0 10px 25px rgba(139, 92, 246, 0.4)'
                }} 
                onClick={handleAutomateAll} 
                disabled={loading || !keyword}
              >
                ✨ 원클릭 자동 완성 (100% 자동화)
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Title Selection */}
        {step === 2 && (
          <div style={{ ...styles.card, ...styles.fadeIn }}>
            <h2 style={{ marginBottom: '20px', color: '#1e293b', fontSize: '1.6rem' }}>
              ✍️ 제목을 선택하세요
            </h2>
            <p style={{ color: '#64748b', marginBottom: '30px' }}>
              AI가 생성한 최적의 제목 중 하나를 선택해 주세요.
            </p>

            <ul style={styles.list}>
              {generatedTitles.map((t, idx) => (
                <li 
                  key={idx} 
                  style={{
                    ...styles.listItem,
                    borderColor: selectedTitle === t ? '#004e92' : '#f1f5f9',
                    backgroundColor: selectedTitle === t ? '#f0f9ff' : '#fff',
                    transform: selectedTitle === t ? 'scale(1.02)' : 'none',
                    boxShadow: selectedTitle === t ? '0 4px 12px rgba(0, 78, 146, 0.15)' : 'none'
                  }}
                  onClick={() => setSelectedTitle(t)}
                >
                  <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '1.05rem' }}>{t}</span>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: selectedTitle === t ? '6px solid #004e92' : '2px solid #cbd5e1',
                    transition: 'all 0.2s'
                  }} />
                </li>
              ))}
            </ul>

            <div style={styles.buttonGroup}>
              <button 
                style={styles.prevButton} 
                onClick={() => setStep(1)}
                disabled={loading}
              >
                ← 이전 단계
              </button>
              <button 
                style={{
                  ...styles.button,
                  marginTop: 0,
                  opacity: selectedTitle ? 1 : 0.5,
                  cursor: selectedTitle ? 'pointer' : 'not-allowed'
                }} 
                onClick={handleGenerateContent} 
                disabled={loading || !selectedTitle}
              >
                {loading ? '본문 생성 중...' : '다음 단계 (본문 생성) →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Body Content View */}
        {step === 3 && !loading && tempContent && (
          <div style={{ ...styles.card, ...styles.fadeIn }}>
            <h2 style={{ marginBottom: '20px', color: '#1e293b', fontSize: '1.6rem' }}>
              📝 생성된 본문 확인
            </h2>
            <p style={{ color: '#64748b', marginBottom: '30px' }}>
              블로그 본문이 생성되었습니다. 확인 후 본문 흐름에 맞는 이미지 생성을 진행하세요.
            </p>

            <div style={{ 
              background: '#f8fafc', 
              padding: '25px', 
              borderRadius: '16px', 
              border: '1px solid #e2e8f0',
              maxHeight: '400px',
              overflowY: 'auto',
              marginBottom: '30px',
              fontSize: '1rem',
              lineHeight: '1.6',
              whiteSpace: 'pre-line'
            }}>
              {tempContent}
            </div>

            <div style={styles.buttonGroup}>
              <button 
                style={styles.prevButton} 
                onClick={() => setStep(2)}
                disabled={loading}
              >
                ← 이전 단계 (제목 다시 선택)
              </button>
              <button 
                style={styles.button} 
                onClick={handleGenerateImages} 
                disabled={loading}
              >
                {loading ? '이미지 생성 중...' : '다음 단계 (이미지 생성) →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Image Generation View */}
        {step === 4 && !loading && tempImages.length > 0 && (
          <div style={{ ...styles.card, ...styles.fadeIn }}>
            <h2 style={{ marginBottom: '20px', color: '#1e293b', fontSize: '1.6rem' }}>
              🎨 생성된 이미지 확인
            </h2>
            <p style={{ color: '#64748b', marginBottom: '30px' }}>
              본문 흐름에 맞춘 이미지가 생성되었습니다. 최종 결과물을 확인하세요.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              {tempImages.map((img, idx) => (
                <div key={idx} style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  <img src={img.url} alt={`Generated ${idx}`} style={{ width: '100%', display: 'block' }} />
                </div>
              ))}
              {tempThumbnail && (
                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '2px solid #004e92' }}>
                  <img src={tempThumbnail.url} alt="Thumbnail" style={{ width: '100%', display: 'block' }} />
                  <div style={{ background: '#004e92', color: '#fff', padding: '4px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>대표 썸네일</div>
                </div>
              )}
            </div>

            <div style={styles.buttonGroup}>
              <button 
                style={styles.prevButton} 
                onClick={() => setStep(3)}
                disabled={loading}
              >
                ← 이전 단계 (본문 다시 확인)
              </button>
              <button 
                style={styles.button} 
                onClick={() => setStep(5)} 
                disabled={loading}
              >
                최종 결과물 확인하기 →
              </button>
            </div>
          </div>
        )}

        {/* Loading State Overlay */}
        {loading && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(255,255,255,0.95)', zIndex: 999,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
            {isAutomating ? (
              <>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid #e2e8f0', borderTopColor: '#6d28d9', animation: 'spin 1s linear infinite', marginBottom: '20px' }} />
                <h2 style={{color: '#6d28d9', fontSize: '2.5rem', marginBottom: '10px', fontWeight: 800}}>{progressPercent}%</h2>
                <h3 style={{color: '#1e293b', fontSize: '1.2rem', marginBottom: '20px'}}>{loadingMessage}</h3>
                <div style={{ width: '300px', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '6px', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #8b5cf6 0%, #6d28d9 100%)', transition: 'width 0.3s ease' }} />
                </div>
                <p style={{ color: '#64748b', marginTop: '15px', fontWeight: 500 }}>모든 과정을 자동으로 진행하고 있습니다. 잠시만 기다려주세요.</p>
              </>
            ) : (
              <>
                <Spinner />
                <h3 style={{color: '#004e92', fontSize: '1.5rem', marginBottom: '10px'}}>{loadingMessage}</h3>
                <p style={{ color: '#64748b' }}>최적의 블로그 포스팅을 위해 AI가 작업 중입니다.</p>
              </>
            )}
          </div>
        )}

        {/* Step 5: Result */}
        {!loading && blogPost && step === 5 && (
          <div style={{ ...styles.resultContainer, ...styles.fadeIn }} ref={bottomRef}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <span style={{ 
                background: '#ecfdf5', 
                color: '#047857', 
                padding: '10px 25px', 
                borderRadius: '30px', 
                fontSize: '1rem', 
                fontWeight: 'bold',
                border: '1px solid #d1fae5',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
              }}>
                ✅ 콘텐츠 생성 완료
              </span>
              <button 
                onClick={handleResetAll}
                style={{ ...styles.secondaryButton, marginTop: 0 }}
              >
                🔄 처음부터 다시하기
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
               <button style={styles.actionButton} onClick={handleDownloadAllImages}>
                  💾 이미지 전체 다운로드
               </button>
               <button style={styles.actionButton} onClick={() => copyToClipboard(blogPost.title)}>
                  📑 제목 복사
               </button>
               <button style={styles.actionButton} onClick={() => copyToClipboard(blogPost.content)}>
                  📋 본문 복사
               </button>
            </div>

            <h1 style={styles.blogTitle}>{blogPost.title}</h1>
            
            <div style={styles.blogContent}>
              {renderContentWithImages(blogPost.content, blogPost.images)}
            </div>

            {blogPost.thumbnail && (
              <div style={styles.thumbnailContainer}>
                <h4 style={{ marginBottom: '25px', color: '#334155', fontWeight: 800, fontSize: '1.2rem' }}>🎨 대표 썸네일 (1:1)</h4>
                <img 
                  src={blogPost.thumbnail.url} 
                  alt="Post Thumbnail" 
                  style={{ maxWidth: '500px', width: '100%', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }} 
                />
                 <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                    <button 
                      style={styles.actionButton}
                      onClick={() => downloadImage(blogPost.thumbnail!.url, 'thumbnail.png')}
                    >
                      💾 썸네일 다운로드
                    </button>
                </div>
              </div>
            )}
            
            <div style={styles.buttonGroup}>
                <button 
                  style={styles.prevButton}
                  onClick={() => setStep(4)}
                >
                  ← 이전 단계 (이미지 확인)
                </button>
            </div>
          </div>
        )}
      </div>

      <div style={styles.footer}>
        Designed by {DEVELOPER_NAME}
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('app')!);
root.render(<App />);
