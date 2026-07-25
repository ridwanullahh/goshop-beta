import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useCommerce } from '@/context/CommerceContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  RefreshCw,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Upload,
  Send,
  User,
  Calendar
} from 'lucide-react';

export default function RefundDispute() {
  const { sdk, currentUser } = useCommerce();
  const { toast } = useToast();
  const [refundRequests, setRefundRequests] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [refundForm, setRefundForm] = useState({
    orderId: '',
    productId: '',
    reason: '',
    evidence: [] as string[]
  });
  const [disputeMessage, setDisputeMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!sdk || !currentUser) return;

    try {
      const [refundsData, disputesData, ordersData] = await Promise.all([
        sdk.getRefundRequests(currentUser.id, 'customer'),
        sdk.getData('disputes'),
        sdk.getUserOrders(currentUser.id)
      ]);

      setRefundRequests(refundsData);
      setDisputes(disputesData.filter((d: any) => d.customerId === currentUser.id));
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load refund and dispute data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefundRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sdk || !currentUser) return;

    try {
      const order = orders.find(o => o.id === refundForm.orderId);
      const product = order?.items.find((item: any) => item.productId === refundForm.productId);
      
      if (!order || !product) {
        toast({
          title: "Error",
          description: "Invalid order or product selection.",
          variant: "destructive"
        });
        return;
      }

      const refundData = {
        orderId: refundForm.orderId,
        productId: refundForm.productId,
        customerId: currentUser.id,
        sellerId: product.sellerId,
        amount: product.price * product.quantity + (product.shippingCost || 0),
        reason: refundForm.reason,
        evidence: refundForm.evidence
      };

      await sdk.createRefundRequest(refundData);
      
      toast({
        title: "Success",
        description: "Refund request submitted successfully!"
      });

      setShowRefundForm(false);
      setRefundForm({ orderId: '', productId: '', reason: '', evidence: [] });
      loadData();
    } catch (error) {
      console.error('Error submitting refund request:', error);
      toast({
        title: "Error",
        description: "Failed to submit refund request.",
        variant: "destructive"
      });
    }
  };

  const handleCreateDispute = async (refundRequestId: string) => {
    if (!sdk || !currentUser) return;

    try {
      const disputeData = {
        refundRequestId,
        customerId: currentUser.id,
        sellerId: refundRequests.find(r => r.id === refundRequestId)?.sellerId
      };

      await sdk.createDispute(disputeData);
      
      toast({
        title: "Success",
        description: "Dispute created successfully!"
      });

      loadData();
    } catch (error) {
      console.error('Error creating dispute:', error);
      toast({
        title: "Error",
        description: "Failed to create dispute.",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async (disputeId: string) => {
    if (!sdk || !currentUser || !disputeMessage.trim()) return;

    try {
      await sdk.addDisputeMessage(disputeId, {
        senderId: currentUser.id,
        senderType: 'customer',
        message: disputeMessage
      });

      setDisputeMessage('');
      toast({
        title: "Success",
        description: "Message sent successfully!"
      });

      loadData();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock, label: 'Pending' },
      approved: { variant: 'default' as const, icon: CheckCircle, label: 'Approved' },
      rejected: { variant: 'destructive' as const, icon: AlertTriangle, label: 'Rejected' },
      completed: { variant: 'default' as const, icon: CheckCircle, label: 'Completed' },
      open: { variant: 'secondary' as const, icon: MessageSquare, label: 'Open' },
      in_progress: { variant: 'default' as const, icon: RefreshCw, label: 'In Progress' },
      resolved: { variant: 'default' as const, icon: CheckCircle, label: 'Resolved' },
      closed: { variant: 'outline' as const, icon: FileText, label: 'Closed' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Refunds & Disputes</h1>
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Refunds & Disputes</h1>
              <p className="text-muted-foreground">
                Manage your refund requests and dispute resolutions
              </p>
            </div>
            <Button onClick={() => setShowRefundForm(true)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Request Refund
            </Button>
          </div>

          {showRefundForm && (
            <Card>
              <CardHeader>
                <CardTitle>Request Refund</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRefundRequest} className="space-y-4">
                  <div>
                    <Label htmlFor="orderId">Select Order</Label>
                    <select
                      id="orderId"
                      value={refundForm.orderId}
                      onChange={(e) => {
                        setRefundForm(prev => ({ ...prev, orderId: e.target.value, productId: '' }));
                        setSelectedOrder(orders.find(o => o.id === e.target.value));
                      }}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Select an order</option>
                      {orders.map(order => (
                        <option key={order.id} value={order.id}>
                          Order #{order.id.slice(-8)} - ${order.total.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedOrder && (
                    <div>
                      <Label htmlFor="productId">Select Product</Label>
                      <select
                        id="productId"
                        value={refundForm.productId}
                        onChange={(e) => setRefundForm(prev => ({ ...prev, productId: e.target.value }))}
                        className="w-full p-2 border rounded-md"
                        required
                      >
                        <option value="">Select a product</option>
                        {selectedOrder.items.map((item: any) => (
                          <option key={item.productId} value={item.productId}>
                            {item.name} - ${item.price} × {item.quantity}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="reason">Reason for Refund</Label>
                    <Textarea
                      id="reason"
                      value={refundForm.reason}
                      onChange={(e) => setRefundForm(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Please explain why you're requesting a refund..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowRefundForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Submit Refund Request
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="refunds" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="refunds">Refund Requests</TabsTrigger>
              <TabsTrigger value="disputes">Disputes</TabsTrigger>
            </TabsList>

            <TabsContent value="refunds" className="space-y-4">
              {refundRequests.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <RefreshCw className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No refund requests</h3>
                    <p className="text-muted-foreground">
                      You haven't submitted any refund requests yet
                    </p>
                  </CardContent>
                </Card>
              ) : (
                refundRequests.map((refund) => (
                  <Card key={refund.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold">Refund Request #{refund.id.slice(-8)}</h3>
                          <p className="text-sm text-muted-foreground">
                            Order #{refund.orderId.slice(-8)} • Amount: ${refund.amount.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {getStatusBadge(refund.status)}
                          {refund.status === 'rejected' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCreateDispute(refund.id)}
                            >
                              Create Dispute
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="font-medium">Reason:</span>
                          <p className="text-sm text-muted-foreground">{refund.reason}</p>
                        </div>
                        
                        {refund.adminNotes && (
                          <div>
                            <span className="font-medium">Admin Response:</span>
                            <p className="text-sm text-muted-foreground">{refund.adminNotes}</p>
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                          Submitted: {new Date(refund.createdAt).toLocaleDateString()}
                          {refund.resolvedAt && (
                            <> • Resolved: {new Date(refund.resolvedAt).toLocaleDateString()}</>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="disputes" className="space-y-4">
              {disputes.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No disputes</h3>
                    <p className="text-muted-foreground">
                      You don't have any active disputes
                    </p>
                  </CardContent>
                </Card>
              ) : (
                disputes.map((dispute) => (
                  <Card key={dispute.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold">Dispute #{dispute.id.slice(-8)}</h3>
                          <p className="text-sm text-muted-foreground">
                            Refund Request #{dispute.refundRequestId.slice(-8)}
                          </p>
                        </div>
                        {getStatusBadge(dispute.status)}
                      </div>

                      {/* Messages */}
                      <div className="space-y-3 mb-4">
                        {dispute.messages?.map((message: any) => (
                          <div
                            key={message.id}
                            className={`p-3 rounded-lg ${
                              message.senderType === 'customer'
                                ? 'bg-blue-50 ml-8'
                                : message.senderType === 'seller'
                                ? 'bg-gray-50 mr-8'
                                : 'bg-yellow-50'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-3 w-3" />
                              <span className="text-xs font-medium">
                                {message.senderType === 'customer' ? 'You' : 
                                 message.senderType === 'seller' ? 'Seller' : 'Admin'}
                              </span>
                              <Calendar className="h-3 w-3" />
                              <span className="text-xs text-muted-foreground">
                                {new Date(message.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm">{message.message}</p>
                          </div>
                        ))}
                      </div>

                      {/* Send Message */}
                      {dispute.status === 'open' || dispute.status === 'in_progress' ? (
                        <div className="flex gap-2">
                          <Input
                            value={disputeMessage}
                            onChange={(e) => setDisputeMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSendMessage(dispute.id)}
                            disabled={!disputeMessage.trim()}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          This dispute has been {dispute.status}
                          {dispute.resolution && (
                            <div className="mt-2 p-2 bg-green-50 rounded">
                              <span className="font-medium">Resolution:</span> {dispute.resolution}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
