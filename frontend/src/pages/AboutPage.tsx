import React from 'react';
import { ArrowLeft, Users, TrendingUp, Calendar, MessageCircle, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center space-x-3 text-secondary-600 hover:text-secondary-900 transition-colors p-3 rounded-xl hover:bg-white/50"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Назад на главную</span>
          </button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-3xl">💡</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">
            О Startup Scout
          </h1>
          <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
            Платформа для открытия и поддержки инновационных проектов
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-secondary-200 p-8 mb-8">
          <h2 className="text-3xl font-bold text-secondary-900 mb-6">Наша миссия</h2>
          <p className="text-lg text-secondary-700 leading-relaxed mb-6">
            Startup Scout создан для того, чтобы помочь талантливым разработчикам и предпринимателям 
            найти свою аудиторию и получить обратную связь от сообщества. Мы верим, что каждый 
            инновационный проект заслуживает быть замеченным.
          </p>
          <p className="text-lg text-secondary-700 leading-relaxed">
            Наша платформа объединяет создателей и энтузиастов, создавая экосистему, где 
            идеи могут расти и развиваться благодаря поддержке сообщества.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-xl border border-secondary-200 p-8">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-accent-600" />
            </div>
            <h3 className="text-xl font-bold text-secondary-900 mb-3">Голосование за проекты</h3>
            <p className="text-secondary-600">
              Поддерживайте понравившиеся проекты и помогайте им подниматься в рейтинге. 
              Ваш голос может изменить судьбу стартапа.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-secondary-200 p-8">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-accent-600" />
            </div>
            <h3 className="text-xl font-bold text-secondary-900 mb-3">Комментарии и обсуждения</h3>
            <p className="text-secondary-600">
              Делитесь мнением, задавайте вопросы и получайте обратную связь от сообщества. 
              Конструктивная критика помогает проектам развиваться.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-secondary-200 p-8">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-accent-600" />
            </div>
            <h3 className="text-xl font-bold text-secondary-900 mb-3">Сообщество энтузиастов</h3>
            <p className="text-secondary-600">
              Присоединяйтесь к сообществу людей, которые любят инновации и хотят быть 
              в курсе последних технологических трендов.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-secondary-200 p-8">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-accent-600" />
            </div>
            <h3 className="text-xl font-bold text-secondary-900 mb-3">Еженедельные запуски</h3>
            <p className="text-secondary-600">
              Каждую неделю мы представляем новые проекты, давая им равные шансы 
              быть замеченными и получить поддержку сообщества.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-xl border border-secondary-200 p-8 mb-12">
          <h2 className="text-3xl font-bold text-secondary-900 mb-8 text-center">Как это работает</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">Публикуйте проект</h3>
              <p className="text-secondary-600">
                Расскажите о своем проекте, добавьте описание, изображения и контакты
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">Получайте голоса</h3>
              <p className="text-secondary-600">
                Сообщество голосует за ваш проект, помогая ему подниматься в рейтинге
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">Развивайтесь</h3>
              <p className="text-secondary-600">
                Получайте обратную связь, находите единомышленников и развивайте проект
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl p-8 text-center text-white mb-8">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Присоединяйтесь к сообществу</h2>
          <p className="text-lg mb-6 opacity-90">
            Станьте частью экосистемы инноваций и помогите талантливым проектам найти свою аудиторию
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-white text-accent-600 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Начать исследовать проекты
          </button>
        </div>

        {/* Author Contact Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-secondary-200 p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-accent-600" />
          </div>
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">Связаться с автором</h2>
          <p className="text-lg text-secondary-600 mb-6">
            Если хотите помочь в развитии проекта или вы нашли баг, то напишите автору проекта
          </p>
          <a
            href="https://t.me/khadzakos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-3 px-8 py-4 bg-accent-500 text-white rounded-xl font-semibold hover:bg-accent-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c-.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
            </svg>
            <span>Написать в Telegram</span>
          </a>
        </div>
      </div>
    </div>
  );
};
