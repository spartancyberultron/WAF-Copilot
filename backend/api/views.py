from django.shortcuts import render
from rest_framework.views import APIView
from api.serializers import UserSerializer
from rest_framework.response import Response
import rest_framework.status as status
from rest_framework.permissions import IsAuthenticated , AllowAny

# Create your views here.
class CreateUser(APIView):
    permission_classes=[AllowAny]
    serializer_class = UserSerializer
    def post(self,request):
        data = request.data
        serializer = self.serializer_class(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message":"User created"},status=status.HTTP_201_CREATED)
        else :
            return Response({"message":f"User Not Created {serializer.error_messages()}"},status=status.HTTP_400_BAD_REQUEST)
