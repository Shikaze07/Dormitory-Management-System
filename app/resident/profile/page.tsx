import { getResidentProfile } from "@/lib/actions/user-actions"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Calendar, Mail, MapPin, QrCode, Shield, Info } from "lucide-react"
import { QRCodeCell } from "@/components/shared/qr-code-cell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"

export default async function ResidentProfilePage() {
  const { user, error } = await getResidentProfile()

  if (error || !user) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex flex-col items-center justify-center h-[400px] text-center">
          <Info className="h-10 w-10 text-muted-foreground opacity-20 mb-4" />
          <h2 className="text-xl font-semibold text-destructive">Profile Error</h2>
          <p className="text-muted-foreground max-w-xs mx-auto">
            {error || "Could not load profile information. Please contact administration."}
          </p>
        </div>
      </div>
    )
  }

  const roomInfo = user.room_assignment[0]?.room

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <User className="h-6 w-6" />
            <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
          </div>
          <p className="text-muted-foreground">
            View and manage your personal information and dormitory details.
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Personal Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.photo || undefined} alt={`${user.first_name} ${user.last_name}`} />
                <AvatarFallback className="text-xl">
                  {user.first_name[0]}{user.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{user.first_name} {user.last_name}</CardTitle>
                <CardDescription>Resident</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Date of Birth</p>
                  <p className="font-medium">{format(new Date(user.dob), "MMMM dd, yyyy")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Gender</p>
                  <p className="font-medium">{user.gender}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Username</p>
                  <p className="font-medium">{user.username}</p>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* QR Code Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Digital Access
            </CardTitle>
            <CardDescription>Your personal QR code for entry and exit.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <QRCodeCell value={user.qr_code} size={180} />
            </div>
            <p className="mt-4 text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
            </p>
          </CardContent>
        </Card>

        {/* Room Assignment */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Dormitory Assignment
            </CardTitle>
            <CardDescription>Your current room allocation details.</CardDescription>
          </CardHeader>
          <CardContent>
            {roomInfo ? (
              <div className="space-y-4">
                <div className="text-center p-6 bg-primary/5 rounded-xl border border-primary/10">
                  <h3 className="text-4xl font-bold text-primary">Room {roomInfo.room_number}</h3>
                  <p className="text-muted-foreground mt-1">Active Assignment</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase">Capacity</p>
                    <p className="font-semibold text-lg">{roomInfo.capacity} Beds</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase">Status</p>
                    <p className="font-semibold text-lg text-emerald-600 font-medium">{roomInfo.status}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <MapPin className="h-10 w-10 text-muted-foreground opacity-20 mb-2" />
                <p className="text-muted-foreground">No active room assignment found.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity / Visitor Requests Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Visitor Requests</CardTitle>
            <CardDescription>Your latest visit notifications and status.</CardDescription>
          </CardHeader>
          <CardContent>
            {user.visitor_requests.length > 0 ? (
              <div className="space-y-4">
                {user.visitor_requests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${request.status === 'Approved' ? 'bg-emerald-500' :
                        request.status === 'Pending' ? 'bg-amber-500' :
                          'bg-slate-300'
                        }`} />
                      <div>
                        <p className="font-medium text-sm">{request.visitor.first_name} {request.visitor.last_name}</p>
                        <p className="text-xs text-muted-foreground">{request.purpose}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium">{format(new Date(request.expected_at), "MMM dd, HH:mm")}</p>
                      <p className={`text-[10px] uppercase font-bold tracking-tighter ${request.status === 'Approved' ? 'text-emerald-600' :
                        request.status === 'Pending' ? 'text-amber-600' :
                          'text-muted-foreground'
                        }`}>{request.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p>No recent visitor requests.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
