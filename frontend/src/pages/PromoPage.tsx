import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Rocket, 
  Users, 
  TrendingUp, 
  Star, 
  CheckCircle, 
  Zap,
  Target,
  Globe,
  Heart,
  Lightbulb,
  Award
} from 'lucide-react';
import { CTAButton } from '../components/CTAButton';
import { FeatureCard } from '../components/FeatureCard';
import { IconCard } from '../components/IconCard';

export const PromoPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Запускайте проекты",
      description: "Покажите миру свой продукт и получите обратную связь от сообщества"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Стройте аудиторию",
      description: "Найдите первых пользователей и единомышленников для вашего проекта"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Отслеживайте прогресс",
      description: "Следите за популярностью и получайте голоса от сообщества"
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Открывайте новое",
      description: "Находите интересные проекты и вдохновляйтесь идеями других"
    }
  ];



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-fire-gradient opacity-90"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute top-1/2 right-1/3 w-8 h-8 bg-white/10 rounded-full animate-float-delayed"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-8">
              <Zap className="w-4 h-4 mr-2" />
              Платформа для стартапов нового поколения
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up">
              Startup Scout
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed animate-fade-in-up">
              Откройте для себя лучшие новые продукты, запустите свой проект и станьте частью сообщества инноваторов
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <CTAButton onClick={() => navigate('/')}>
                К проектам
              </CTAButton>
              <CTAButton 
                onClick={() => navigate('/login')}
                variant="secondary"
              >
                Присоединиться
              </CTAButton>
            </div>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-white/80">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>Бесплатно навсегда</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>Мгновенный запуск</span>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-6">
              Почему выбирают Startup Scout?
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Мы создали платформу, которая помогает стартапам расти и находить свою аудиторию
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (

<FeatureCard 
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 150}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-gradient-to-r from-primary-50 to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-6">
                Все что нужно для успешного запуска
              </h2>
              <p className="text-xl text-secondary-600 mb-8">
                Startup Scout предоставляет все инструменты и возможности для того, чтобы ваш проект получил максимальное внимание и обратную связь
              </p>
              
              
              <button 
                onClick={() => window.open('https://startup-scout.ru/login', '_blank')}
                className="mt-8 px-8 py-4 bg-accent-500 text-white rounded-xl font-semibold hover:bg-accent-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Создать аккаунт
              </button>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <IconCard 
                    icon={<Target className="w-8 h-8" />}
                    title="Целевая аудитория"
                    description="Найдите своих первых пользователей"
                    delay={0}
                  />
                  <IconCard 
                    icon={<Globe className="w-8 h-8 text-accent-500" />}
                    title="Глобальное сообщество"
                    description="Свяжитесь с инноваторами по всей России и СНГ"
                    delay={100}
                  />
                </div>
                <div className="space-y-4 mt-8">
                  <IconCard 
                    icon={<Heart className="w-8 h-8 text-success-500" />}
                    title="Обратная связь"
                    description="Получайте честные отзывы"
                    delay={200}
                  />
                  <IconCard 
                    icon={<Award className="w-8 h-8 text-warning-500" />}
                    title="Признание"
                    description="Выигрывайте еженедельные голосования"
                    delay={300}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-fire-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Lightbulb className="w-16 h-16 text-white mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Готовы запустить свой проект?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Присоединяйтесь к тысячам предпринимателей, которые уже используют Startup Scout для роста своих проектов
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.open('https://startup-scout.ru/login', '_blank')}
              className="px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Создать аккаунт
            </button>
            <button 
              onClick={() => navigate('/')}
              className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-all duration-200"
            >
              Посмотреть проекты
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-12 bg-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Startup Scout</h3>
            <p className="text-secondary-400 mb-6">
              Платформа для открытия и запуска инновационных проектов
            </p>
            <div className="flex justify-center space-x-6 text-secondary-400">
              <button 
                onClick={() => navigate('/about')}
                className="hover:text-white transition-colors"
              >
                О нас
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="hover:text-white transition-colors"
              >
                Вход и регистрация
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
