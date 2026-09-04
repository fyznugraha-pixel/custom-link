import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function SuggestionsAdminPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email || session.user.email !== 'fyznugraha@gmail.com') {
    redirect('/');
  }

  const suggestions = await prisma.suggestion.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Suggestions</h1>
          <p className="text-muted-foreground mt-1">User feedback, feature requests, and ideas.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Content</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {suggestions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No suggestions yet.
                  </td>
                </tr>
              ) : (
                suggestions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                      {format(new Date(item.createdAt), 'MMM d, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 min-w-[300px]">
                      <p className="text-slate-800 whitespace-pre-wrap">{item.content}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.email ? (
                        <a href={`mailto:${item.email}`} className="text-blue-600 hover:underline">
                          {item.email}
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">Anonymous</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
